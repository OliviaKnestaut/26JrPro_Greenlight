/**
 * Uploads an event cover image to the server and returns the stored filename.
 *
 * @param file - The File object selected by the user.
 * @returns The filename saved on the server (e.g. "event_abc123.jpg").
 */
export async function uploadEventImage(file: File): Promise<string> {
  const base = (import.meta as any).env?.BASE_URL ?? '/';
  const endpoint = `${base}upload.php`;

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(endpoint, { method: 'POST', body: formData });

  if (!response.ok) {
    let errorMessage = 'Image upload failed';
    try {
      const errorData = await response.json();
      if (errorData?.error) errorMessage = errorData.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (!data?.filename) {
    throw new Error('Upload response did not include a filename');
  }
  return data.filename as string;
}
