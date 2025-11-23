#!/usr/bin/env bun
/**
 * Documentation Validator
 *
 * This script checks if all features in FEATURES.md are documented in the User Guide
 * Run: bun run scripts/validate-docs.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const FEATURES_PATH = join(process.cwd(), 'FEATURES.md');
const USER_GUIDE_PATH = join(process.cwd(), 'src/screens/UserGuideScreen.tsx');

interface Feature {
  name: string;
  status: string;
  guideSection: string;
}

function parseFeatures(content: string): Feature[] {
  const features: Feature[] = [];
  const lines = content.split('\n');

  let currentFeature: Partial<Feature> | null = null;

  for (const line of lines) {
    // Detect feature headers (### N. Feature Name)
    if (line.match(/^### \d+\. /)) {
      if (currentFeature && currentFeature.name) {
        features.push(currentFeature as Feature);
      }
      currentFeature = {
        name: line.replace(/^### \d+\. /, '').trim(),
        status: '',
        guideSection: ''
      };
    }

    // Extract status
    if (currentFeature && line.startsWith('**Status**:')) {
      currentFeature.status = line.replace('**Status**:', '').trim();
    }

    // Extract guide section reference
    if (currentFeature && line.startsWith('**User Guide Section**:')) {
      currentFeature.guideSection = line.replace('**User Guide Section**:', '').trim();
    }
  }

  // Add last feature
  if (currentFeature && currentFeature.name) {
    features.push(currentFeature as Feature);
  }

  return features;
}

function checkUserGuideContent(content: string, features: Feature[]): void {
  console.log('\n📚 Checking User Guide Coverage...\n');

  let hasIssues = false;

  for (const feature of features) {
    // Skip features that are planned or in progress
    if (feature.status.includes('📋 Planned')) {
      console.log(`⏭️  ${feature.name}: Planned (not yet implemented)`);
      continue;
    }

    // Check if implemented features have guide section
    if (feature.status.includes('✅ Implemented')) {
      if (feature.guideSection.includes('⚠️ TO BE ADDED')) {
        console.log(`⚠️  ${feature.name}: Missing User Guide documentation`);
        hasIssues = true;
      } else if (feature.guideSection) {
        // Verify the section exists in User Guide
        const sectionName = feature.guideSection.split('→')[0].trim();
        if (content.includes(sectionName) || content.toLowerCase().includes(sectionName.toLowerCase())) {
          console.log(`✅ ${feature.name}: Documented in User Guide`);
        } else {
          console.log(`⚠️  ${feature.name}: Referenced section "${sectionName}" not found in User Guide`);
          hasIssues = true;
        }
      } else {
        console.log(`⚠️  ${feature.name}: No User Guide section specified`);
        hasIssues = true;
      }
    } else if (feature.status.includes('🚧 In Progress')) {
      console.log(`🚧 ${feature.name}: In Progress (documentation can wait)`);
    }
  }

  console.log('\n');

  if (hasIssues) {
    console.log('❌ Documentation issues found. Please update FEATURES.md and/or UserGuideScreen.tsx\n');
    process.exit(1);
  } else {
    console.log('✅ All implemented features are properly documented!\n');
  }
}

function main() {
  console.log('🔍 Validating Documentation...');

  try {
    const featuresContent = readFileSync(FEATURES_PATH, 'utf-8');
    const userGuideContent = readFileSync(USER_GUIDE_PATH, 'utf-8');

    const features = parseFeatures(featuresContent);
    console.log(`\nFound ${features.length} features in FEATURES.md`);

    checkUserGuideContent(userGuideContent, features);

  } catch (error) {
    console.error('Error reading files:', error);
    process.exit(1);
  }
}

main();
