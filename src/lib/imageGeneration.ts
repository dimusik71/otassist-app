import * as FileSystem from 'expo-file-system';

/**
 * Nano Banana Pro (Gemini 3 Pro Image) Generation
 * Google's latest image generation and editing model
 */

export interface NanoBananaGenerationOptions {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '2:3';
  resolution?: '1024x1024' | '2048x2048' | '3840x2160' | 'auto';
  numberOfImages?: number;
  negativePrompt?: string;
  safetySettings?: 'BLOCK_NONE' | 'BLOCK_FEW' | 'BLOCK_SOME' | 'BLOCK_MOST';
  personGeneration?: boolean;
}

export interface NanoBananaEditOptions {
  prompt: string;
  imageBase64: string;
  maskBase64?: string;
  numberOfImages?: number;
  safetySettings?: 'BLOCK_NONE' | 'BLOCK_FEW' | 'BLOCK_SOME' | 'BLOCK_MOST';
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
 * Generate an image using Nano Banana Pro (Gemini 3 Pro Image)
 */
export async function generateImageWithNanoBanana(
  options: NanoBananaGenerationOptions
): Promise<string> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    // Build the request payload
    const requestBody: any = {
      prompt: options.prompt,
      number_of_images: options.numberOfImages || 1,
    };

    if (options.aspectRatio) requestBody.aspect_ratio = options.aspectRatio;
    if (options.resolution && options.resolution !== 'auto') requestBody.resolution = options.resolution;
    if (options.negativePrompt) requestBody.negative_prompt = options.negativePrompt;
    if (options.safetySettings) requestBody.safety_settings = options.safetySettings;
    if (options.personGeneration !== undefined) requestBody.person_generation = options.personGeneration;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-3-pro-image:generateImage?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Nano Banana Pro generation failed: ${error}`);
    }

    const data = await response.json();
    if (!data.images || data.images.length === 0) {
      throw new Error('No image generated');
    }

    // Images are returned as base64 strings
    const base64Image = data.images[0].image;

    // Save base64 image to file
    const timestamp = Date.now();
    const fileUri = `${FileSystem.documentDirectory}nano_banana_${timestamp}.png`;
    await FileSystem.writeAsStringAsync(fileUri, base64Image, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  } catch (error) {
    console.error('[imageGeneration.ts]: Nano Banana Pro generation error:', error);
    throw error;
  }
}

/**
 * Edit an image using Nano Banana Pro (Gemini 3 Pro Image)
 */
export async function editImageWithNanoBanana(
  options: NanoBananaEditOptions
): Promise<string> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    const requestBody: any = {
      prompt: options.prompt,
      image: options.imageBase64,
      number_of_images: options.numberOfImages || 1,
    };

    if (options.maskBase64) requestBody.mask = options.maskBase64;
    if (options.safetySettings) requestBody.safety_settings = options.safetySettings;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-3-pro-image:editImage?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Nano Banana Pro edit failed: ${error}`);
    }

    const data = await response.json();
    if (!data.images || data.images.length === 0) {
      throw new Error('No edited image returned');
    }

    const base64EditedImage = data.images[0].image;

    // Save edited image
    const timestamp = Date.now();
    const fileUri = `${FileSystem.documentDirectory}nano_banana_edited_${timestamp}.png`;
    await FileSystem.writeAsStringAsync(fileUri, base64EditedImage, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  } catch (error) {
    console.error('[imageGeneration.ts]: Nano Banana Pro edit error:', error);
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
 * Generate equipment mockup visualization using Nano Banana Pro
 */
export async function generateEquipmentMockup(
  equipmentName: string,
  roomType: string,
  style: 'realistic' | 'technical' = 'realistic'
): Promise<string> {
  const prompt = style === 'realistic'
    ? `Professional, photorealistic image of ${equipmentName} installed in a ${roomType}. Clean, well-lit, modern interior design. High quality, architectural photography style.`
    : `Technical diagram showing ${equipmentName} installation in a ${roomType}. Clean schematic style with measurements and specifications. Professional technical illustration.`;

  return generateImageWithNanoBanana({
    prompt,
    aspectRatio: '16:9',
    resolution: '2048x2048',
    numberOfImages: 1,
  });
}

/**
 * Generate property modification visualization using Nano Banana Pro
 */
export async function generatePropertyModification(
  modificationType: string,
  roomType: string,
  details: string
): Promise<string> {
  const prompt = `Professional architectural visualization showing ${modificationType} in a ${roomType}. ${details}. Photorealistic, well-lit, modern design. High quality interior rendering.`;

  return generateImageWithNanoBanana({
    prompt,
    aspectRatio: '3:2',
    resolution: '2048x2048',
    numberOfImages: 1,
  });
}

/**
 * Generate IoT device placement visualization using Nano Banana Pro
 */
export async function generateIoTDevicePlacementVisualization(
  deviceName: string,
  roomType: string,
  placementDetails: string
): Promise<string> {
  const prompt = `Photorealistic interior view of a ${roomType} showing ${deviceName} placement. ${placementDetails}. Professional, well-lit, modern smart home design. Clear visibility of device location.`;

  return generateImageWithNanoBanana({
    prompt,
    aspectRatio: '4:3',
    resolution: '2048x2048',
    numberOfImages: 1,
  });
}
