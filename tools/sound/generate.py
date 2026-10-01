"""
Git Gym の効果音（SE）と BGM を合成して WAV で書き出す。

標準ライブラリだけで動くので、Python 3 があれば追加インストールは不要。
    py -3 tools/sound/generate.py          # Windows
    python3 tools/sound/generate.py        # Mac

出力先: src/renderer/assets/sounds/
BGM は小節単位でぴったり切っているので、ループ再生しても継ぎ目が出ない。
"""

import math
import random
import struct
import wave
from pathlib import Path

RATE = 22050  # 容量を抑えるため 22.05kHz（ゲームの SE / BGM には十分）
OUT = Path(__file__).resolve().parents[2] / "src" / "renderer" / "assets" / "sounds"

NOTES = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def freq(note: str) -> float:
    """'A4' のような音名を周波数にする"""
    name, octave = note[:-1], int(note[-1])
    semitone = NOTES[name] + (octave - 4) * 12 - 9
    return 440.0 * 2 ** (semitone / 12)


# ---------- 波形 ----------

def square(phase: float, duty: float = 0.5) -> float:
    return 1.0 if (phase % 1.0) < duty else -1.0


def triangle(phase: float) -> float:
    p = phase % 1.0
    return 4 * p - 1 if p < 0.5 else 3 - 4 * p


def sine(phase: float) -> float:
    return math.sin(2 * math.pi * phase)


def noise(_phase: float) -> float:
    return random.uniform(-1, 1)


def envelope(t: float, length: float, attack=0.005, decay=0.08, sustain=0.6, release=0.08) -> float:
    """ADSR エンベロープ"""
    if t < attack:
        return t / attack
    if t < attack + decay:
        return 1 - (1 - sustain) * (t - attack) / decay
    if t < length - release:
        return sustain
    if t < length:
        return sustain * (length - t) / release
    return 0.0


def tone(buf: list, start: float, length: float, f: float, wave_fn, volume=0.3, slide=0.0, **env):
    """buf の start 秒から、長さ length 秒の音を足し込む（slide で音程を上下させる）"""
    begin = int(start * RATE)
    count = int(length * RATE)
    phase = 0.0
    for i in range(count):
        t = i / RATE
        current = f * (1 + slide * t / length)
        phase += current / RATE
        idx = begin + i
        if idx >= len(buf):
            break
        buf[idx] += wave_fn(phase) * envelope(t, length, **env) * volume


def blank(seconds: float) -> list:
    return [0.0] * int(seconds * RATE)


def lowpass(buf: list, amount: float = 0.35) -> list:
    """矩形波の耳障りな高音を少し丸める簡単なローパス"""
    out, prev = [], 0.0
    for s in buf:
        prev += amount * (s - prev)
        out.append(prev)
    return out


def save(name: str, buf: list, peak: float = 0.8):
    m = max(1e-9, max(abs(s) for s in buf))
    scale = peak / m if m > peak else 1.0
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s * scale)) * 32767)) for s in buf))
    print(f"  {name}.wav  {len(buf) / RATE:.2f}s")


# ---------- 効果音 ----------

def se_success():
    """コマンド成功・チェック達成：明るく上がる2音"""
    buf = blank(0.32)
    tone(buf, 0.00, 0.10, freq("E5"), lambda p: square(p, 0.25), 0.22)
    tone(buf, 0.08, 0.22, freq("B5"), lambda p: square(p, 0.25), 0.22, decay=0.1, sustain=0.4)
    return lowpass(buf)


def se_error():
    """失敗：低く下がるブザー"""
    buf = blank(0.3)
    tone(buf, 0.0, 0.28, freq("A3"), lambda p: square(p, 0.5), 0.2, slide=-0.25, sustain=0.7)
    return lowpass(buf, 0.25)


def se_click():
    """ボタン：短いクリック"""
    buf = blank(0.06)
    tone(buf, 0.0, 0.05, freq("C6"), triangle, 0.25, attack=0.001, decay=0.03, sustain=0.2, release=0.02)
    return buf


def se_mission():
    """ミッション（レッスン）クリア：きらきらしたアルペジオ"""
    buf = blank(1.0)
    for i, n in enumerate(["C5", "E5", "G5", "C6", "E6"]):
        tone(buf, i * 0.08, 0.5, freq(n), lambda p: square(p, 0.125), 0.16, decay=0.2, sustain=0.3, release=0.25)
        tone(buf, i * 0.08, 0.5, freq(n) * 2, sine, 0.06, decay=0.2, sustain=0.2, release=0.25)
    return lowpass(buf, 0.4)


def se_stage_clear():
    """ステージクリア：短いファンファーレ"""
    buf = blank(1.5)
    melody = [("G4", 0.0, 0.12), ("C5", 0.12, 0.12), ("E5", 0.24, 0.12), ("G5", 0.36, 0.3), ("E5", 0.66, 0.12), ("G5", 0.78, 0.6)]
    for n, start, length in melody:
        tone(buf, start, length, freq(n), lambda p: square(p, 0.25), 0.2, sustain=0.6)
    for n in ["C4", "E4", "G4"]:
        tone(buf, 0.78, 0.65, freq(n), triangle, 0.12, sustain=0.7, release=0.3)
    return lowpass(buf, 0.4)


def se_star():
    """星が1つ付くとき"""
    buf = blank(0.3)
    tone(buf, 0.0, 0.25, freq("A6"), sine, 0.25, attack=0.002, decay=0.08, sustain=0.3, release=0.15)
    tone(buf, 0.03, 0.22, freq("E7"), sine, 0.12, attack=0.002, decay=0.08, sustain=0.2, release=0.12)
    return buf


# ---------- BGM ----------

def bgm(name: str, bpm: float, chords: list, melody: list, lead_duty=0.25, lead_vol=0.11, drums=True):
    """
    chords: 1小節ごとのコード（構成音のリスト）
    melody: (音名 or None, 拍数) の並び。全体の長さはコード数 × 4拍に合わせる
    """
    beat = 60 / bpm
    bars = len(chords)
    total = bars * 4 * beat
    buf = blank(total)

    for bar, chord in enumerate(chords):
        bar_start = bar * 4 * beat
        # ベース：ルート音を8分で刻む
        for i in range(8):
            root = chord[0][:-1] + str(int(chord[0][-1]) - 1)
            tone(buf, bar_start + i * beat / 2, beat / 2 * 0.9, freq(root), triangle, 0.22, decay=0.05, sustain=0.8, release=0.03)
        # アルペジオ：16分でコードの構成音を回す
        for i in range(16):
            n = chord[i % len(chord)]
            tone(buf, bar_start + i * beat / 4, beat / 4 * 0.8, freq(n), lambda p: square(p, 0.125), 0.05, decay=0.04, sustain=0.4, release=0.02)
        if drums:
            for i in range(4):
                t = bar_start + i * beat
                # キック（1・3拍）とスネア（2・4拍）、裏拍のハイハット
                if i % 2 == 0:
                    tone(buf, t, 0.12, 90, sine, 0.35, slide=-0.6, attack=0.001, decay=0.06, sustain=0.2, release=0.05)
                else:
                    tone(buf, t, 0.1, 1, noise, 0.12, attack=0.001, decay=0.05, sustain=0.1, release=0.04)
                tone(buf, t + beat / 2, 0.03, 1, noise, 0.04, attack=0.001, decay=0.02, sustain=0.1, release=0.01)

    pos = 0.0
    for note, beats in melody:
        length = beats * beat
        if note:
            tone(buf, pos, length * 0.92, freq(note), lambda p: square(p, lead_duty), lead_vol, decay=0.1, sustain=0.55, release=0.06)
        pos += length

    save(name, lowpass(buf, 0.3), peak=0.7)


def bgm_home():
    """ホーム：ゆったりした明るいループ（C - Am - F - G を2周）"""
    C, Am, F, G = ["C4", "E4", "G4"], ["A3", "C4", "E4"], ["F3", "A3", "C4"], ["G3", "B3", "D4"]
    melody = [
        ("E5", 1), ("G5", 1), ("C6", 1.5), ("B5", 0.5), ("A5", 2), ("E5", 1), ("C5", 1),
        ("F5", 1), ("A5", 1), ("C6", 1), ("A5", 1), ("G5", 3), (None, 1),
        ("E5", 1), ("G5", 1), ("C6", 1.5), ("D6", 0.5), ("E6", 2), ("C6", 1), ("A5", 1),
        ("F5", 1), ("A5", 1), ("G5", 1), ("B5", 1), ("C6", 3), (None, 1),
    ]
    bgm("bgm_home", 96, [C, Am, F, G, C, Am, F, G], melody)


def bgm_practice():
    """練習中：集中のじゃまにならない控えめなループ（Am - F - C - G）"""
    Am, F, C, G = ["A3", "C4", "E4"], ["F3", "A3", "C4"], ["C4", "E4", "G4"], ["G3", "B3", "D4"]
    melody = [
        ("A4", 2), ("C5", 2), ("E5", 3), (None, 1),
        ("F5", 2), ("E5", 2), ("C5", 3), (None, 1),
        ("G4", 2), ("C5", 2), ("E5", 2), ("D5", 2),
        ("B4", 3), (None, 1), ("D5", 4),
    ]
    bgm("bgm_practice", 84, [Am, F, C, G], melody, lead_duty=0.5, lead_vol=0.06, drums=False)


if __name__ == "__main__":
    random.seed(42)  # ノイズを毎回同じにして、生成し直しても差分が出ないようにする
    print("SE:")
    save("se_success", se_success())
    save("se_error", se_error())
    save("se_click", se_click())
    save("se_mission", se_mission())
    save("se_stage_clear", se_stage_clear())
    save("se_star", se_star())
    print("BGM:")
    bgm_home()
    bgm_practice()
