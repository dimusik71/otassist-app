import * as FileSystem from 'expo-file-system';

/**
 * Ideogram 3.0 Image Generation
 */

export interface IdeogramGenerationOptions {
  prompt: string;
  aspectRatio?: '1x1' | '16x9' | '9x16' | '4x3' | '3x4' | '1x2' | '2x1' | '1x3' | '3x1' | '10x16' | '16x10' | '2x3' | '3x2' | '4x5' | '5x4';
  resolution?: string;
  renderingSpeed?: 'FLASH' | 'TURBO' | 'DEFAULT' | 'QUALITY';
  negativePrompt?: string;
  magicPrompt?: 'AUTO' | 'ON' | 'OFF';
  numImages?: number;
  styleType?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'FICTION';
}

export interface IdeogramEditOptions {
  prompt: string;
  imageUri: string;
  maskUri: string;
  renderingSpeed?: 'FLASH' | 'TURBO' | 'DEFAULT' | 'QUALITY';
  magicPrompt?: 'AUTO' | 'ON' | 'OFF';
  numImages?: number;
  styleType?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'FICTION';
}

export interface GPTImageGenerationOptions {
  prompt: string;
  size?: '1024x1024' | '1536x1024' | '1024x1536' | 'auto';
  quality?: 'low' | 'medium' | 'high' | 'auto';
  n?: number;
}

export interface GPTImageEditOptions {
  prompt: string;
  imageUri: string;
  maskUri?: string;
  size?: '1024x1024' | '1536x1024' | '1024x1536' | 'auto';
  quality?: 'low' | 'medium' | 'high' | 'auto';
  outputFormat?: 'png' | 'jpeg' | 'webp';
  outputCompression?: number;
  background?: 'transparent' | 'opaque';
  inputFidelity?: 'low' | 'high';
}

/**
 * Generate an image using Ideogram 3.0
 */
export async function generateImageWithIdeogram(
  options: IdeogramGenerationOptions
): Promise<string> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_VIBECODE_IDEOGRAM_API_KEY;
    if (!apiKey) {
      throw new Error('Ideogram API key not configured');
    }

    const formData = new FormData();
    formData.append('prompt', options.prompt);

    if (options.aspectRatio) formData.append('aspect_ratio', options.aspectRatio);
    if (options.resolution) formData.append('resolution', options.resolution);
    if (options.renderingSpeed) formData.append('rendering_speed', options.renderingSpeed);
    if (options.negativePrompt) formData.append('negative_prompt', options.negativePrompt);
    if (options.magicPrompt) formData.append('magic_prompt', options.magicPrompt);
    if (options.numImages) formData.append('num_images', options.numImages.toString());
    if (options.styleType) formData.append('style_type', options.styleType);

    const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ideogram generation failed: ${error}`);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      throw new Error('No image generated');
    }

    const imageUrl = data.data[0].url;

    // Download the image immediately (URLs expire quickly)
    const timestamp = Date.now();
    const fileUri = `${FileSystem.documentDirectory}ideogram_${timestamp}.png`;
    await FileSystem.downloadAsync(imageUrl, fileUri);

    return fileUri;
  } catch (error) {
    console.error('[imageGeneration.ts]: Ideogram generation error:', error);
    throw error;
  }
}

/**
 * Edit an image using Ideogram 3.0
 */
export async function editImageWithIdeogram(
  options: IdeogramEditOptions
): Promise<string> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_VIBECODE_IDEOGRAM_API_KEY;
    if (!apiKey) {
      throw new Error('Ideogram API key not configured');
    }

    const formData = new FormData();
    formData.append('prompt', options.prompt);
    formData.append('rendering_speed', options.renderingSpeed || 'DEFAULT');

    // Add image file
    formData.append('image', {
      uri: options.imageUri,
      type: 'image/png',
      name: 'image.png',
    } as any);

    // Add mask file
    formData.append('mask', {
      uri: options.maskUri,
      type: 'image/png',
      name: 'mask.png',
    } as any);

    if (options.magicPrompt) formData.append('magic_prompt', options.magicPrompt);
    if (options.numImages) formData.append('num_images', options.numImages.toString());
    if (options.styleType) formData.append('style_type', options.styleType);

    const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/edit', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ideogram edit failed: ${error}`);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      throw new Error('No edited image returned');
    }

    const editedUrl = data.data[0].url;

    // Download the edited image immediately
    const timestamp = Date.now();
    const fileUri = `${FileSystem.documentDirectory}ideogram_edited_${timestamp}.png`;
    await FileSystem.downloadAsync(editedUrl, fileUri);

    return fileUri;
  } catch (error) {
    console.error('[imageGeneration.ts]: Ideogram edit error:', error);
    throw error;
  }
}

/**
 * Generate an image using GPT Image 1
 */
export async function generateImageWithGPT(
  options: GPTImageGenerationOptions
): Promise<string> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: options.prompt,
        size: options.size || '1024x1024',
        quality: options.quality || 'high',
        n: options.n || 1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GPT Image generation failed: ${error}`);
    }

    const result = await response.json();
    if (!result.data || result.data.length === 0) {
      throw new Error('No image generated');
    }

    const base64Image = result.data[0].b64_json;

    // Save base64 image to file
    const timestamp = Date.now();
    const fileUri = `${FileSystem.documentDirectory}gpt_image_${timestamp}.png`;
    await FileSystem.writeAsStringAsync(fileUri, base64Image, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  } catch (error) {
    console.error('[imageGeneration.ts]: GPT Image generation error:', error);
    throw error;
  }
}

/**
 * Edit an image using GPT Image 1
 */
export async function editImageWithGPT(
  options: GPTImageEditOptions
): Promise<string> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', options.prompt);

    // Add image file
    formData.append('image', {
      uri: options.imageUri,
      type: 'image/png',
      name: 'image.png',
    } as any);

    // Add mask if provided
    if (options.maskUri) {
      formData.append('mask', {
        uri: options.maskUri,
        type: 'image/png',
        name: 'mask.png',
      } as any);
    }

    if (options.size) formData.append('size', options.size);
    if (options.quality) formData.append('quality', options.quality);
    if (options.outputFormat) formData.append('output_format', options.outputFormat);
    if (options.outputCompression) formData.append('output_compression', options.outputCompression.toString());
    if (options.background) formData.append('background', options.background);
    if (options.inputFidelity) formData.append('input_fidelity', options.inputFidelity);

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GPT Image edit failed: ${error}`);
    }

    const result = await response.json();
    if (!result.data || result.data.length === 0) {
      throw new Error('No edited image returned');
    }

    const editedBase64 = result.data[0].b64_json;

    // Save edited image
    const timestamp = Date.now();
    const fileUri = `${FileSystem.documentDirectory}gpt_edited_${timestamp}.png`;
    await FileSystem.writeAsStringAsync(fileUri, editedBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  } catch (error) {
    console.error('[imageGeneration.ts]: GPT Image edit error:', error);
    throw error;
  }
}

/**
 * Generate equipment mockup visualization
 */
export async function generateEquipmentMockup(
  equipmentName: string,
  roomType: string,
  style: 'realistic' | 'technical' = 'realistic'
): Promise<string> {
  const prompt = style === 'realistic'
    ? `Professional, photorealistic image of ${equipmentName} installed in a ${roomType}. Clean, well-lit, modern interior design. High quality, architectural photography style.`
    : `Technical diagram showing ${equipmentName} installation in a ${roomType}. Clean schematic style with measurements and specifications. Professional technical illustration.`;

  return generateImageWithIdeogram({
    prompt,
    aspectRatio: '16x9',
    renderingSpeed: 'TURBO',
    styleType: style === 'realistic' ? 'REALISTIC' : 'DESIGN',
    magicPrompt: 'ON',
  });
}

/**
 * Generate property modification visualization
 */
export async function generatePropertyModification(
  modificationType: string,
  roomType: string,
  details: string
): Promise<string> {
  const prompt = `Professional architectural visualization showing ${modificationType} in a ${roomType}. ${details}. Photorealistic, well-lit, modern design. High quality interior rendering.`;

  return generateImageWithGPT({
    prompt,
    size: '1536x1024',
    quality: 'high',
  });
}

/**
 * Generate IoT device placement visualization
 */
export async function generateIoTDevicePlacementVisualization(
  deviceName: string,
  roomType: string,
  placementDetails: string
): Promise<string> {
  const prompt = `Photorealistic interior view of a ${roomType} showing ${deviceName} placement. ${placementDetails}. Professional, well-lit, modern smart home design. Clear visibility of device location.`;

  return generateImageWithIdeogram({
    prompt,
    aspectRatio: '4x3',
    renderingSpeed: 'DEFAULT',
    styleType: 'REALISTIC',
    magicPrompt: 'ON',
  });
}
