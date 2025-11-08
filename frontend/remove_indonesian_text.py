#!/usr/bin/env python3
import re

# Read the file
with open('components/CreateHarvestNFTForm.tsx', 'r') as f:
    content = f.read()

# Remove Indonesian text in parentheses from option values
# Pattern: (Text in Indonesian)
content = re.sub(r' \([^)]+\)</option>', '</option>', content)

# Write back
with open('components/CreateHarvestNFTForm.tsx', 'w') as f:
    f.write(content)

print("✅ Removed Indonesian text from CreateHarvestNFTForm.tsx")
