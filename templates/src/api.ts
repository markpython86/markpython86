/**
 * API module for fetching and parsing GitHub contribution calendar data
 */

export interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0-4 intensity level
}

/**
 * Fetches the GitHub contribution calendar SVG and converts it to a 2D grid
 * @param username GitHub username
 * @returns 2D array representing the contribution grid (7 rows x 52 columns)
 */
export async function fetchCalendarGrid(username: string): Promise<number[][]> {
  try {
    // Fetch the contributions page
    const response = await fetch(
      `https://github.com/users/${username}/contributions`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch contributions: ${response.status}`);
    }

    const html = await response.text();

    // Parse the HTML to extract the SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Find all contribution day rectangles
    const rects = doc.querySelectorAll("rect[data-date]");

    if (rects.length === 0) {
      throw new Error("No contribution data found");
    }

    // Create a map of date to contribution data
    const contributionMap = new Map<string, ContributionDay>();

    rects.forEach((rect) => {
      const date = rect.getAttribute("data-date");
      const level = rect.getAttribute("data-level");
      const count =
        rect.getAttribute("data-count") ||
        rect.getAttribute("title")?.match(/(\d+)/)?.[1];

      if (date) {
        contributionMap.set(date, {
          date,
          count: count ? parseInt(count, 10) : 0,
          level: level ? parseInt(level, 10) : 0,
        });
      }
    });

    // Generate the grid (7 rows for days of week, 52 columns for weeks)
    const grid: number[][] = Array(7)
      .fill(null)
      .map(() => Array(52).fill(0));

    // Get the current date and calculate the start of the contribution year
    const now = new Date();
    const oneYearAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate()
    );

    // Fill the grid with contribution data
    for (let week = 0; week < 52; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(oneYearAgo);
        currentDate.setDate(oneYearAgo.getDate() + week * 7 + day);

        const dateString = currentDate.toISOString().split("T")[0];
        const contribution = contributionMap.get(dateString);

        if (contribution) {
          // Use the level (0-4) as the grid value for better visual representation
          grid[day][week] = contribution.level;
        }
      }
    }

    return grid;
  } catch (error) {
    console.error("Error fetching contribution data:", error);

    // Return a fallback grid with some sample data for demo purposes
    return generateFallbackGrid();
  }
}

/**
 * Generates a fallback grid with sample contribution data
 * This is used when the actual GitHub data cannot be fetched
 */
function generateFallbackGrid(): number[][] {
  const grid: number[][] = Array(7)
    .fill(null)
    .map(() => Array(52).fill(0));

  // Generate some realistic-looking contribution patterns
  for (let week = 0; week < 52; week++) {
    for (let day = 0; day < 7; day++) {
      // Simulate work patterns (less activity on weekends)
      const isWeekend = day === 0 || day === 6;
      const baseChance = isWeekend ? 0.2 : 0.6;

      // Add some seasonal variation
      const seasonalMultiplier =
        0.5 + 0.5 * Math.sin((week / 52) * Math.PI * 2);
      const chance = baseChance * seasonalMultiplier;

      if (Math.random() < chance) {
        // Generate contribution level (0-4)
        grid[day][week] = Math.floor(Math.random() * 5);
      }
    }
  }

  return grid;
}

/**
 * Gets the color for a contribution level (matching GitHub's color scheme)
 */
export function getContributionColor(level: number): string {
  const colors = [
    "#161b22", // No contributions
    "#0e4429", // Low contributions
    "#006d32", // Medium-low contributions
    "#26a641", // Medium-high contributions
    "#39d353", // High contributions
  ];

  return colors[Math.min(level, 4)] || colors[0];
}
