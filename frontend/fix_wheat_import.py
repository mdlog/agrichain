#!/usr/bin/env python3

# Read the file
with open('app/farmer/page.tsx', 'r') as f:
    content = f.read()

# Find the lucide-react import line
import_line_old = "import { Sprout, Plus, List, TrendingUp, DollarSign, Package, AlertCircle, CheckCircle2, Clock, Shield, Lock, ExternalLink } from 'lucide-react'"
import_line_new = "import { Sprout, Plus, List, TrendingUp, DollarSign, Package, AlertCircle, CheckCircle2, Clock, Shield, Lock, ExternalLink, Wheat, X } from 'lucide-react'"

# Check if Wheat is already imported
if 'Wheat' in content.split('\n')[0:20]:
    print("✅ Wheat already imported!")
else:
    # Replace the import line
    if import_line_old in content:
        content = content.replace(import_line_old, import_line_new)
        print("✅ Added Wheat and X to imports")
    else:
        # Try to find any lucide-react import and add Wheat
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if 'from \'lucide-react\'' in line or 'from "lucide-react"' in line:
                # Add Wheat before the closing brace
                if 'Wheat' not in line:
                    line = line.replace(' } from', ', Wheat, X } from')
                    lines[i] = line
                    print(f"✅ Added Wheat to line {i+1}")
                    break
        content = '\n'.join(lines)

# Write back
with open('app/farmer/page.tsx', 'w') as f:
    f.write(content)

print("✅ Import fixed!")
