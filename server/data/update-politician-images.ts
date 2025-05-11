import * as fs from 'fs';
import * as path from 'path';

// Interface for our politician object
interface Politician {
  id: number;
  name: string;
  party: string;
  position: string;
  imageUrl: string;
  aliases: string[];
}

// Define the structure of the JSON format
interface PoliticiansJsonFormat {
  knesset_members: {
    Name: string;
    Party: string;
    Position: string;
    ImageUrl: string;
    Aliases: string[];
  }[];
  government_members?: {
    Name: string;
    Party: string;
    Position: string;
    ImageUrl: string;
    Aliases: string[];
  }[];
}

// Function to get all image files from the attached_assets directory
function getImageFiles(): string[] {
  const assetsDir = path.resolve('../../attached_assets');
  try {
    const files = fs.readdirSync(assetsDir);
    return files.filter(file => 
      file.endsWith('.png') || 
      file.endsWith('.jpg') || 
      file.endsWith('.jpeg')
    );
  } catch (error) {
    console.error('Error reading attached_assets directory:', error);
    return [];
  }
}

// Function to map politician names to their image files
function mapPoliticiansToImages(politicianData: PoliticiansJsonFormat): void {
  const imageFiles = getImageFiles();
  const jsonPath = path.resolve('../../attached_assets/fixed_politicians.json');
  
  // Combine both knesset members and government members
  const allPoliticians = [...politicianData.knesset_members];
  if (politicianData.government_members) {
    allPoliticians.push(...politicianData.government_members);
  }
  
  let matchCount = 0;
  
  // Loop through politicians and try to match them with image files
  for (let politician of allPoliticians) {
    // Normalize politician name for comparison
    const normalizedName = politician.Name.trim();
    
    // Try to find a direct match
    let matchingFile = imageFiles.find(file => {
      // Remove file extension and normalize
      const fileName = path.basename(file, path.extname(file)).trim();
      return fileName === normalizedName;
    });
    
    // If no direct match, try aliases
    if (!matchingFile && politician.Aliases && politician.Aliases.length > 0) {
      // Also check for match with יולי יואל אדלשטיין -> יולי אדלשטיין
      if (normalizedName === "יולי אדלשטיין") {
        matchingFile = imageFiles.find(file => file.includes("יולי יואל אדלשטיין"));
      }
    }
    
    if (matchingFile) {
      // Update the ImageUrl to use the local file
      politician.ImageUrl = `/attached_assets/${matchingFile}`;
      matchCount++;
      console.log(`✅ Matched: ${politician.Name} -> ${matchingFile}`);
    } else {
      console.log(`❌ No match for: ${politician.Name}`);
    }
  }
  
  console.log(`\nMatched ${matchCount} politicians with images out of ${allPoliticians.length} total politicians.`);
  
  // Write the updated data back to the JSON file
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(politicianData, null, 2));
    console.log(`\nUpdated politicians.json file with new image URLs.`);
  } catch (error) {
    console.error('Error writing to politicians.json:', error);
  }
}

// Main execution
try {
  // Read the politicians JSON file
  const jsonPath = path.resolve('../../attached_assets/fixed_politicians.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  
  // Parse the JSON data
  const parsedData = JSON.parse(jsonData) as PoliticiansJsonFormat;
  
  // Update the politicians with image files
  mapPoliticiansToImages(parsedData);
  
} catch (error) {
  console.error('Failed to process politicians JSON:', error);
}