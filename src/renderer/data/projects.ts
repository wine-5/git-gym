import type { LanguageId } from './languages';

export interface ProjectFile {
  path: string;
  content: string;
}

/**
 * レッスンで使う練習用プロジェクトの雛形。
 * Git の操作は言語に依存しないので、全言語で同じ題材（小さなゲームの Player）を使い、
 * レッスン文中の {mainFile} / {featureFile} をここで定義したファイル名に置き換える。
 */
export interface ProjectTemplate {
  name: string;
  /** エントリーポイント */
  mainFile: string;
  /** レッスンで主に編集させるファイル */
  featureFile: string;
  files: ProjectFile[];
}

const README = `# Git Gym Adventure

Git の練習用の小さなゲームプロジェクトです。
Player を動かしたり、ダメージを受けたりできます。
`;

const csharp: ProjectTemplate = {
  name: 'my-game',
  mainFile: 'Program.cs',
  featureFile: 'Player.cs',
  files: [
    {
      path: 'Player.cs',
      content: `namespace GitGym
{
    public class Player
    {
        public string Name { get; }
        public int Hp { get; private set; } = 100;
        public float X { get; private set; }

        public Player(string name)
        {
            Name = name;
        }

        public void Move(float dx)
        {
            X += dx;
        }

        public void TakeDamage(int amount)
        {
            Hp = System.Math.Max(0, Hp - amount);
        }
    }
}
`,
    },
    {
      path: 'Program.cs',
      content: `using System;

namespace GitGym
{
    public static class Program
    {
        public static void Main()
        {
            var player = new Player("Hero");
            player.Move(1.5f);
            Console.WriteLine($"{player.Name} HP:{player.Hp} X:{player.X}");
        }
    }
}
`,
    },
    { path: 'README.md', content: README },
  ],
};

const cpp: ProjectTemplate = {
  name: 'my-game',
  mainFile: 'main.cpp',
  featureFile: 'player.cpp',
  files: [
    {
      path: 'player.h',
      content: `#pragma once
#include <string>

class Player {
public:
    explicit Player(std::string name);

    void move(float dx);
    void takeDamage(int amount);

    const std::string& name() const { return name_; }
    int hp() const { return hp_; }
    float x() const { return x_; }

private:
    std::string name_;
    int hp_ = 100;
    float x_ = 0.0f;
};
`,
    },
    {
      path: 'player.cpp',
      content: `#include "player.h"
#include <algorithm>

Player::Player(std::string name) : name_(std::move(name)) {}

void Player::move(float dx) {
    x_ += dx;
}

void Player::takeDamage(int amount) {
    hp_ = std::max(0, hp_ - amount);
}
`,
    },
    {
      path: 'main.cpp',
      content: `#include <iostream>
#include "player.h"

int main() {
    Player player("Hero");
    player.move(1.5f);
    std::cout << player.name() << " HP:" << player.hp() << " X:" << player.x() << std::endl;
    return 0;
}
`,
    },
    { path: 'README.md', content: README },
  ],
};

const python: ProjectTemplate = {
  name: 'my-game',
  mainFile: 'main.py',
  featureFile: 'player.py',
  files: [
    {
      path: 'player.py',
      content: `class Player:
    def __init__(self, name: str):
        self.name = name
        self.hp = 100
        self.x = 0.0

    def move(self, dx: float) -> None:
        self.x += dx

    def take_damage(self, amount: int) -> None:
        self.hp = max(0, self.hp - amount)
`,
    },
    {
      path: 'main.py',
      content: `from player import Player


def main() -> None:
    player = Player("Hero")
    player.move(1.5)
    print(f"{player.name} HP:{player.hp} X:{player.x}")


if __name__ == "__main__":
    main()
`,
    },
    { path: 'README.md', content: README },
  ],
};

const javascript: ProjectTemplate = {
  name: 'my-game',
  mainFile: 'main.js',
  featureFile: 'player.js',
  files: [
    {
      path: 'player.js',
      content: `export class Player {
  constructor(name) {
    this.name = name;
    this.hp = 100;
    this.x = 0;
  }

  move(dx) {
    this.x += dx;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }
}
`,
    },
    {
      path: 'main.js',
      content: `import { Player } from './player.js';

const player = new Player('Hero');
player.move(1.5);
console.log(\`\${player.name} HP:\${player.hp} X:\${player.x}\`);
`,
    },
    { path: 'README.md', content: README },
  ],
};

const typescript: ProjectTemplate = {
  name: 'my-game',
  mainFile: 'main.ts',
  featureFile: 'player.ts',
  files: [
    {
      path: 'player.ts',
      content: `export class Player {
  hp = 100;
  x = 0;

  constructor(public readonly name: string) {}

  move(dx: number): void {
    this.x += dx;
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }
}
`,
    },
    {
      path: 'main.ts',
      content: `import { Player } from './player';

const player = new Player('Hero');
player.move(1.5);
console.log(\`\${player.name} HP:\${player.hp} X:\${player.x}\`);
`,
    },
    { path: 'README.md', content: README },
  ],
};

const java: ProjectTemplate = {
  name: 'my-game',
  mainFile: 'Main.java',
  featureFile: 'Player.java',
  files: [
    {
      path: 'Player.java',
      content: `public class Player {
    private final String name;
    private int hp = 100;
    private float x = 0f;

    public Player(String name) {
        this.name = name;
    }

    public void move(float dx) {
        x += dx;
    }

    public void takeDamage(int amount) {
        hp = Math.max(0, hp - amount);
    }

    public String getName() { return name; }
    public int getHp() { return hp; }
    public float getX() { return x; }
}
`,
    },
    {
      path: 'Main.java',
      content: `public class Main {
    public static void main(String[] args) {
        Player player = new Player("Hero");
        player.move(1.5f);
        System.out.println(player.getName() + " HP:" + player.getHp() + " X:" + player.getX());
    }
}
`,
    },
    { path: 'README.md', content: README },
  ],
};

export const PROJECTS: Record<LanguageId, ProjectTemplate> = {
  csharp,
  cpp,
  python,
  javascript,
  typescript,
  java,
};
