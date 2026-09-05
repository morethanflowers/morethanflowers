import 'server-only';

import { headers } from 'next/headers';

export type ChatGPTUser = {
  id: string;
  email: string;
};

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const id = requestHeaders.get('oai-authenticated-user-id')?.trim();
  const email = requestHeaders.get('oai-authenticated-user-email')?.trim();

  return id && email ? { id, email } : null;
}

export function chatGPTSignInPath(returnTo: string): string {
  return `/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`;
}

export function chatGPTSignOutPath(returnTo: string): string {
  return `/signout-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`;
}
