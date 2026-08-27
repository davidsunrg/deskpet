import { readFile, writeFile } from 'node:fs/promises';

const MESSAGE_FILE = 'project.inlang/messages/en.json';

async function sortMessages(file: string) {
  const raw = await readFile(file, 'utf8');
  const messages = JSON.parse(raw) as Record<string, string>;
  const sortedMessages = Object.fromEntries(
    Object.entries(messages).sort(([a], [b]) => a.localeCompare(b, 'en'))
  );

  await writeFile(file, `${JSON.stringify(sortedMessages, null, 2)}\n`);
}

await sortMessages(MESSAGE_FILE);

console.log('Locale keys sorted (en.json)');
