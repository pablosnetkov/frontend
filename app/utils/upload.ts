export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/v1/images/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const data = await response.json();
        return data.image_url; // Предполагаю, что API возвращает URL в поле image_url
    } catch (error: unknown) {
        console.error('Error uploading image:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to upload image');
    }
} 