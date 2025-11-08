#!/usr/bin/env python3

# Read the file
with open('app/farmer/page.tsx', 'r') as f:
    lines = f.readlines()

# Check if imports already exist
has_harvest_form = any('CreateHarvestNFTForm' in line for line in lines[:20])
has_my_nfts = any('MyHarvestNFTs' in line for line in lines[:20])

if has_harvest_form and has_my_nfts:
    print("✅ All imports already exist!")
else:
    # Find the line after hbarUtils import to add new imports
    insert_index = -1
    for i, line in enumerate(lines):
        if 'hbarUtils' in line:
            insert_index = i + 1
            break
    
    if insert_index > 0:
        if not has_harvest_form:
            lines.insert(insert_index, "import CreateHarvestNFTForm from '@/components/CreateHarvestNFTForm'\n")
            insert_index += 1
            print("✅ Added CreateHarvestNFTForm import")
        
        if not has_my_nfts:
            lines.insert(insert_index, "import MyHarvestNFTs from '@/components/MyHarvestNFTs'\n")
            print("✅ Added MyHarvestNFTs import")

# Write back
with open('app/farmer/page.tsx', 'w') as f:
    f.writelines(lines)

print("✅ Imports fixed!")
