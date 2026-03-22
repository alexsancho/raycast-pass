import fs from "fs/promises";
import path from "path";
import { homedir } from "os";
import { spawn } from "child_process";
import * as pwd from 'micro-password-generator';
// Use cryptographically secure RNG. Do not use Math.random(), it's not secure
import { randomBytes } from '@noble/hashes/utils';
import { getPreferenceValues } from "@raycast/api";
import { sortDirectoriesFirst } from "./utils";

const preferences = getPreferenceValues<Preferences.SearchPass>();

function pass(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const cli = spawn(preferences.cli, args, {
      env: {
        PASSWORD_STORE_DIR: preferences.store,
        HOME: homedir(),
        PATH: [
          "/bin", // osascript
          "/usr/bin", // osascript
          "/usr/local/bin", // gpg
          "/usr/local/MacGPG2/bin", // gpg
          "/opt/homebrew/bin", // homebrew on macOS Apple Silicon
        ].join(":"),
      },
      timeout: 5000
    });

    cli.on("error", reject);

    const stderr: Buffer[] = [];
    cli.stderr.on("data", (chunk: Buffer): number => stderr.push(chunk));
    cli.stderr.on("end", () => stderr.length > 0 && reject(stderr.join("")));

    const stdout: Buffer[] = [];
    cli.stdout.on("data", (chunk: Buffer): number => stdout.push(chunk));
    cli.stdout.on("end", () => resolve(stdout.join("")));
  });
}

async function show(entry: string) {
  const result = await pass(["show", entry]).then((data) => data.split("\n"));
  const content: Map<string, string> = new Map();
  let first = true;
  for (const line of result) {
    if (first) {
      first = false;
      content.set("pass", line);
      continue;
    }

    const idx = line.indexOf(":");
    if (idx <= 0) {
      continue;
    }
    content.set(line.substring(0, idx), line.substring(idx + 1).trim());
  }

  return Array.from(content.entries());
}

async function list(dir: string, recursive: boolean): Promise<string[]> {
  const entries = await fs.readdir(path.join(preferences.store, dir), { withFileTypes: true });
  const names: string[] = [];
  for (const dirent of entries) {
    if (dirent.name.startsWith(".")) {
      continue;
    }

    if (dirent.isDirectory()) {
      if (recursive) {
        const children = await list(path.join(dir, dirent.name), recursive);
        names.push(...children.map((c) => path.join(dirent.name, c)));
      } else {
        names.push(path.join(dirent.name, "/"));
      }
    } else if (dirent.isFile() && dirent.name.endsWith(".gpg")) {
      names.push(dirent.name.substring(0, dirent.name.length - 4));
    }
  }

  return sortDirectoriesFirst(names);
}

async function createPass(mask: string): Promise<string> {
  return pwd.mask(mask).apply(randomBytes(32)).password;
}

export default { createPass, show, list };
