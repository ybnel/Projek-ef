export const LEVEL_CONFIG = {
    small_stars: {
        stages: [
            { id: 1, type: 'find_pair', gridSize: 12, pairCount: 6, score: 15, time: 30 }, // Find The Pair (3x4 Grid)
            { id: 2, type: 'line_match', score: 20, time: 45 }, // Line Matching Game
            { id: 3, type: 'spelling', count: 2, score: 30, time: 60 }, // Spelling Game (2 rounds)
        ]
    },
    trailblazers: {
        stages: [
            { id: 1, type: 'match', pairs: 8, score: 15, time: 90 }, // Stage 1
            { id: 2, type: 'fill_blank', count: 5, score: 20, time: 120 } // Stage 2
        ]
    },
    // Fallback for others
    high_flyers: {
        stages: [
            { id: 1, type: 'puzzle', score: 25, time: 90 }, // Bedroom Scene
            { id: 2, type: 'puzzle', score: 25, time: 90 }, // Restaurant Scene (Randomly rotated but effectively stage 2)
            { id: 3, type: 'text_memory', pairCount: 8, score: 30, time: 90 } // Antonyms & Verbs
        ]
    },
    frontrunner: { stages: [{ id: 1, type: 'match', pairs: 8, score: 20, time: 90 }] }
};

export const FILL_BLANK_DATA = {
    trailblazers: [
        { id: 1, sentence: "The sun is ___ today.", answer: "Hot", options: ["Hot", "Cold", "Blue"] },
        { id: 2, sentence: "Elephants are very ___.", answer: "Big", options: ["Big", "Small", "Tiny"] },
        { id: 3, sentence: "Birds fly ___ in the sky.", answer: "Up", options: ["Up", "Down", "Under"] },
        { id: 4, sentence: "I feel ___ when I smile.", answer: "Happy", options: ["Happy", "Sad", "Angry"] },
        { id: 5, sentence: "Turtles are very ___.", answer: "Slow", options: ["Slow", "Fast", "Quick"] }
    ]
};

export const PUZZLE_GAME_DATA = {
    high_flyers: [
        {
            id: 1,
            imageId: 'bedroom',
            instruction: "Match the words to the clothes!",
            items: [
                { id: 'dress', label: 'Dress', target: { top: '52%', left: '10%', width: '25%', height: '25%' } },
                { id: 'green_shirt', label: 'Shirt', target: { top: '35%', left: '55%', width: '18%', height: '18%' } },
                { id: 'jeans', label: 'Jeans', target: { top: '68%', left: '18%', width: '22%', height: '25%' } },
                { id: 'hat_boy', label: 'Hat', target: { top: '35%', left: '80%', width: '15%', height: '18%' } },
                { id: 'shoes', label: 'Shoes', target: { top: '58%', left: '62%', width: '12%', height: '12%' } },
                { id: 'boots', label: 'Boots', target: { top: '18%', left: '25%', width: '10%', height: '15%' } },
                { id: 'cap', label: 'Cap', target: { top: '15%', left: '82%', width: '10%', height: '10%' } },
                { id: 'skirt', label: 'Skirt', target: { top: '35%', left: '35%', width: '15%', height: '15%' } }
            ]
        },
        {
            id: 2,
            imageId: 'restaurant',
            instruction: "Find the food items!",
            items: [
                { id: 'pizza', label: 'Pizza', target: { top: '15%', left: '30%', width: '25%', height: '10%' } },
                { id: 'ice_cream', label: 'Ice Cream', target: { top: '45%', left: '10%', width: '8%', height: '15%' } },
                { id: 'burger', label: 'Burger', target: { top: '80%', left: '5%', width: '12%', height: '12%' } },
                { id: 'salad', label: 'Salad', target: { top: '75%', left: '18%', width: '12%', height: '15%' } },
                { id: 'tea', label: 'Tea', target: { top: '60%', left: '53%', width: '8%', height: '12%' } },
                { id: 'egg', label: 'Eggs', target: { top: '40%', left: '60%', width: '12%', height: '12%' } },
                { id: 'cookies', label: 'Cookies', target: { top: '50%', left: '60%', width: '12%', height: '10%' } },
                { id: 'sandwich', label: 'Sandwich', target: { top: '55%', left: '35%', width: '12%', height: '12%' } }
            ]
        },
        {
            id: 3,
            imageId: 'playroom',
            instruction: "Find the toys!",
            items: [
                { id: 'bear', label: 'Teddy Bear', target: { top: '38%', left: '32%', width: '10%', height: '15%' } },
                { id: 'duck', label: 'Duck', target: { top: '32%', left: '68%', width: '8%', height: '10%' } },
                { id: 'ball', label: 'Ball', target: { top: '48%', left: '73%', width: '8%', height: '10%' } },
                { id: 'blocks', label: 'Blocks', target: { top: '25%', left: '60%', width: '12%', height: '15%' } },
                { id: 'clock', label: 'Clock', target: { top: '60%', left: '40%', width: '8%', height: '12%' } },
                { id: 'train', label: 'Train', target: { top: '58%', left: '20%', width: '15%', height: '12%' } },
                { id: 'book', label: 'Book', target: { top: '48%', left: '50%', width: '10%', height: '12%' } },
                { id: 'headphones', label: 'Headphones', target: { top: '68%', left: '30%', width: '10%', height: '15%' } }
            ]
        }
    ]
};

export const LINE_MATCH_DATA = {
    small_stars: [
        { id: 1, word: "Eating", image: "https://www.superhealthykids.com/wp-content/uploads/2019/09/AdobeStock_254921232.jpeg" },
        { id: 2, word: "Sleeping", image: "https://tse4.mm.bing.net/th/id/OIP.hAHUUn3ffim6YFMHDlHC1AHaE8?pid=Api&P=0&h=220" },
        { id: 3, word: "Running", image: "https://www.outsideonline.com/wp-content/uploads/2022/01/GettyImages-699676974.jpg?crop=16:9&width=1200&enable=upscale" },
        { id: 4, word: "Kicking", image: "https://tse3.mm.bing.net/th/id/OIP.ZCxCubw1jg1dqbe6nG8nHQHaFR?pid=Api&P=0&h=220" },
        { id: 5, word: "Swimming", image: "https://james-mccormack.com/wp-content/uploads/2022/10/Does-Swimming-Build-Muscle-Butterfly.jpg" },
        { id: 6, word: "Crying", image: "https://images.pexels.com/photos/9964634/pexels-photo-9964634.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { id: 7, word: "Drinking", image: "https://tse4.mm.bing.net/th/id/OIP.hmNzWx5zjMHjEMcqhBldAwHaEK?pid=Api&P=0&h=220" },
        { id: 8, word: "Pulling", image: "https://img.freepik.com/premium-vector/illustration-businessmen-are-pulling-rope-competition-concept-one-continuous-line-art-style_7647-2162.jpg?w=2000" },
        { id: 9, word: "Pushing", image: "https://img.freepik.com/premium-photo/man-pushing-large-boulder-uphill-sunrise-symbolizing-determination-perseverance_1132312-6124.jpg" }
    ]
};

// Reusing Matching Data for Find Pair but logic will handle duplication for pairs                                                                                                                                                                              
export const MATCHING_GAME_DATA = {
    small_stars: [
        { id: 1, word: "Cat", image: "https://campus.extension.org/pluginfile.php/610092/course/overviewfiles/Cat_March_2010-1.jpg" }, // Cat
        { id: 2, word: "Dog", image: "https://i.guim.co.uk/img/media/fe1e34da640c5c56ed16f76ce6f994fa9343d09d/0_174_3408_2046/master/3408.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=67773a9d419786091c958b2ad08eae5e" }, // Dog
        { id: 3, word: "Bird", image: "https://media.istockphoto.com/id/626132614/id/foto/redstart-biru-yang-indah.jpg?b=1&s=612x612&w=0&k=20&c=a7bU9hGOlarZwrJqzGohdPerYWwgq3ryIoDQp8cNTro=" }, // Bird
        { id: 4, word: "Fish", image: "https://s7d2.scene7.com/is/image/PetSmart/4032827" }, // Fish
        { id: 5, word: "Rabbit", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgSH-a1RQW_hmydTbpWHW_-Z-DWcXxEyEI9Q&s" }, // Rabbit
        { id: 6, word: "Duck", image: "https://static.vecteezy.com/system/resources/previews/055/395/710/non_2x/a-white-duck-slightly-angled-with-its-orange-webbed-feet-the-duck-appears-alert-and-curious-gazing-forward-with-bright-round-eyes-free-png.png" }, // Duck
        { id: 7, word: "Cow", image: "https://png.pngtree.com/png-clipart/20250309/original/pngtree-holstein-cow-png-image_20610191.png" }, // Cow
        { id: 8, word: "Horse", image: "https://vmceaston.com/wp-content/uploads/2021/10/iStock-540407826-copy-992x1024.png" }, // Horse
    ],
    high_flyers: [
        // Number (Digit) - Number (Word)
        { id: 1, text1: "1", text2: "One" },
        { id: 2, text1: "2", text2: "Two" },
        { id: 3, text1: "3", text2: "Three" },
        { id: 4, text1: "4", text2: "Four" },
        { id: 5, text1: "5", text2: "Five" },
        { id: 6, text1: "10", text2: "Ten" },
        { id: 7, text1: "20", text2: "Twenty" },
        { id: 8, text1: "50", text2: "Fifty" },
        { id: 9, text1: "100", text2: "Hundred" },
    ],
    trailblazers: [
        // Antonyms (Opposites)
        { id: 1, text1: "Hot", text2: "Cold" },
        { id: 2, text1: "Big", text2: "Small" },
        { id: 3, text1: "Up", text2: "Down" },
        { id: 4, text1: "Happy", text2: "Sad" },
        { id: 5, text1: "Fast", text2: "Slow" },
        { id: 6, text1: "Day", text2: "Night" },
        { id: 7, text1: "Good", text2: "Bad" },
        { id: 8, text1: "Rich", text2: "Poor" },
        { id: 9, text1: "Long", text2: "Short" },
    ],
    frontrunner: [
        // Irregular Verbs (V1 - V2)
        { id: 1, text1: "Go", text2: "Went" },
        { id: 2, text1: "Eat", text2: "Ate" },
        { id: 3, text1: "See", text2: "Saw" },
        { id: 4, text1: "Take", text2: "Took" },
        { id: 5, text1: "Make", text2: "Made" },
        { id: 6, text1: "Know", text2: "Knew" },
        { id: 7, text1: "Write", text2: "Wrote" },
        { id: 8, text1: "Speak", text2: "Spoke" },
        { id: 9, text1: "Run", text2: "Ran" },
    ]
};

export const SPELLING_GAME_DATA = {
    small_stars: [
        { id: 1, word: "CAT", image: "https://campus.extension.org/pluginfile.php/610092/course/overviewfiles/Cat_March_2010-1.jpg" },
        { id: 2, word: "DOG", image: "https://i.guim.co.uk/img/media/fe1e34da640c5c56ed16f76ce6f994fa9343d09d/0_174_3408_2046/master/3408.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=67773a9d419786091c958b2ad08eae5e" },
        { id: 3, word: "COW", image: "https://png.pngtree.com/png-clipart/20250309/original/pngtree-holstein-cow-png-image_20610191.png" },
        { id: 4, word: "DUCK", image: "https://static.vecteezy.com/system/resources/previews/055/395/710/non_2x/a-white-duck-slightly-angled-with-its-orange-webbed-feet-the-duck-appears-alert-and-curious-gazing-forward-with-bright-round-eyes-free-png.png" },
        { id: 5, word: "FISH", image: "https://s7d2.scene7.com/is/image/PetSmart/4032827" },
        { id: 6, word: "BIRD", image: "https://media.istockphoto.com/id/626132614/id/foto/redstart-biru-yang-indah.jpg?b=1&s=612x612&w=0&k=20&c=a7bU9hGOlarZwrJqzGohdPerYWwgq3ryIoDQp8cNTro=" }
    ]
};
