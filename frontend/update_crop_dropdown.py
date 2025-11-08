#!/usr/bin/env python3

# Read the file
with open('app/farmer/page.tsx', 'r') as f:
    content = f.read()

# Old crop type dropdown (simple version)
old_dropdown = '''                                <select
                                    className="input"
                                    value={formData.cropType}
                                    onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                                    required
                                >
                                    <option value="">Select your crop type</option>
                                    <option value="Corn">🌽 Corn</option>
                                    <option value="Rice">🌾 Rice</option>
                                    <option value="Wheat">🌾 Wheat</option>
                                    <option value="Soybean">🫘 Soybean</option>
                                    <option value="Coffee">☕ Coffee</option>
                                    <option value="Cotton">🌱 Cotton</option>
                                </select>'''

# New comprehensive dropdown (without Indonesian text)
new_dropdown = '''                                <select
                                    className="input"
                                    value={formData.cropType}
                                    onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                                    required
                                >
                                    <option value="">Select your crop type</option>
                                    
                                    {/* Cereals & Grains */}
                                    <optgroup label="🌾 Cereals & Grains">
                                        <option value="Rice">Rice</option>
                                        <option value="Wheat">Wheat</option>
                                        <option value="Corn">Corn</option>
                                        <option value="Barley">Barley</option>
                                        <option value="Oats">Oats</option>
                                        <option value="Sorghum">Sorghum</option>
                                        <option value="Millet">Millet</option>
                                    </optgroup>
                                    
                                    {/* Legumes */}
                                    <optgroup label="🫘 Legumes">
                                        <option value="Soybean">Soybean</option>
                                        <option value="Peanut">Peanut</option>
                                        <option value="Green Bean">Green Bean</option>
                                        <option value="Red Bean">Red Bean</option>
                                        <option value="Chickpea">Chickpea</option>
                                        <option value="Lentil">Lentil</option>
                                    </optgroup>
                                    
                                    {/* Vegetables */}
                                    <optgroup label="🥬 Vegetables">
                                        <option value="Tomato">Tomato</option>
                                        <option value="Potato">Potato</option>
                                        <option value="Onion">Onion</option>
                                        <option value="Garlic">Garlic</option>
                                        <option value="Cabbage">Cabbage</option>
                                        <option value="Carrot">Carrot</option>
                                        <option value="Chili">Chili</option>
                                        <option value="Eggplant">Eggplant</option>
                                        <option value="Cucumber">Cucumber</option>
                                        <option value="Lettuce">Lettuce</option>
                                    </optgroup>
                                    
                                    {/* Fruits */}
                                    <optgroup label="🍎 Fruits">
                                        <option value="Banana">Banana</option>
                                        <option value="Mango">Mango</option>
                                        <option value="Papaya">Papaya</option>
                                        <option value="Pineapple">Pineapple</option>
                                        <option value="Watermelon">Watermelon</option>
                                        <option value="Melon">Melon</option>
                                        <option value="Orange">Orange</option>
                                        <option value="Apple">Apple</option>
                                        <option value="Strawberry">Strawberry</option>
                                        <option value="Durian">Durian</option>
                                    </optgroup>
                                    
                                    {/* Cash Crops */}
                                    <optgroup label="☕ Cash Crops">
                                        <option value="Coffee">Coffee</option>
                                        <option value="Cocoa">Cocoa</option>
                                        <option value="Tea">Tea</option>
                                        <option value="Rubber">Rubber</option>
                                        <option value="Palm Oil">Palm Oil</option>
                                        <option value="Sugarcane">Sugarcane</option>
                                        <option value="Cotton">Cotton</option>
                                        <option value="Tobacco">Tobacco</option>
                                    </optgroup>
                                    
                                    {/* Spices & Herbs */}
                                    <optgroup label="🌿 Spices & Herbs">
                                        <option value="Black Pepper">Black Pepper</option>
                                        <option value="Ginger">Ginger</option>
                                        <option value="Turmeric">Turmeric</option>
                                        <option value="Galangal">Galangal</option>
                                        <option value="Lemongrass">Lemongrass</option>
                                        <option value="Vanilla">Vanilla</option>
                                        <option value="Cinnamon">Cinnamon</option>
                                        <option value="Clove">Clove</option>
                                        <option value="Nutmeg">Nutmeg</option>
                                    </optgroup>
                                    
                                    {/* Root Crops */}
                                    <optgroup label="🥔 Root Crops">
                                        <option value="Cassava">Cassava</option>
                                        <option value="Sweet Potato">Sweet Potato</option>
                                        <option value="Taro">Taro</option>
                                        <option value="Yam">Yam</option>
                                    </optgroup>
                                    
                                    {/* Other */}
                                    <optgroup label="🌱 Other">
                                        <option value="Mushroom">Mushroom</option>
                                        <option value="Bamboo">Bamboo</option>
                                        <option value="Other">Other</option>
                                    </optgroup>
                                </select>'''

# Replace
if old_dropdown in content:
    content = content.replace(old_dropdown, new_dropdown)
    print("✅ Crop type dropdown updated in Create New Loan form")
else:
    print("⚠️  Could not find exact match, trying alternative...")
    # Try to find and replace just the options part
    import re
    pattern = r'<option value="">Select your crop type</option>\s*<option value="Corn">🌽 Corn</option>.*?</select>'
    if re.search(pattern, content, re.DOTALL):
        print("Found pattern, but manual replacement needed")
    else:
        print("❌ Pattern not found")

# Write back
with open('app/farmer/page.tsx', 'w') as f:
    f.write(content)

print("✅ File updated!")
