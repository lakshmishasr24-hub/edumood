// data.js - Contains the mood logic, theme configurations, and content generators

export const MOODS = {
    inspired: { color: 'bg-green-500', hex: '#22c55e', label: 'Inspired', score: 6 },
    focused: { color: 'bg-blue-500', hex: '#3b82f6', label: 'Focused', score: 5 },
    reflective: { color: 'bg-teal-500', hex: '#14b8a6', label: 'Reflective', score: 4 },
    overwhelmed: { color: 'bg-orange-500', hex: '#f97316', label: 'Overwhelmed', score: 2 },
    fatigued: { color: 'bg-purple-500', hex: '#a855f7', label: 'Fatigued', score: 3 },
    evaluative: { color: 'bg-red-500', hex: '#ef4444', label: 'Evaluative', score: 3 },
    doubt: { color: 'bg-yellow-500', hex: '#eab308', label: 'Doubt', score: 2 }
};

// "Generate new quotes dynamically based on mood"
// AI simulation segment library
const quoteSegments = {
    inspired: {
        starts: ["Your potential is endless.", "Every great class begins with a small spark.", "Momentum is a privilege.", "The impact you have today ", "Inspiration exists, but it has to find you."],
        ends: ["Honor it by creating.", "Cultivate it.", "Keep building on that foundation.", "Let it drive your teaching.", "Channel it into your students."]
    },
    focused: {
        starts: ["Deep concentration is the crucible of insight.", "Focus is about saying no to distractions.", "Clarity of mind brings clarity of purpose.", "In the quiet of focus,", "One task at a time."],
        ends: ["Stay in the fire.", "Guard your attention.", "Let everything else fade away.", "The results will follow.", "You are exactly where you need to be."]
    },
    overwhelmed: {
        starts: ["You don't have to do everything today.", "One step at a time is enough.", "It is okay to pause.", "The mountain seems high, but", "Breathe in, breathe out."],
        ends: ["Just find the next right thing.", "You are allowed to rest.", "Check your boundaries and hold them.", "Start with the smallest task.", "Take it hour by hour."]
    },
    fatigued: {
        starts: ["Rest is an essential part of the work.", "You cannot pour from an empty cup.", "Even the brightest stars need the night.", "Fatigue is a signal, not a failure.", "Honor your body's limits."],
        ends: ["Take care of yourself first.", "Step away without guilt.", "Replenish your energy.", "Sleep is your greatest tool right now.", "Slow down and reset."]
    },
    evaluative: {
        starts: ["Critique is meant to sharpen, not shatter.", "Look at the data objectively.", "Progress over perfection.", "Evaluation is a stepping stone.", "Assess to improve, not to condemn."],
        ends: ["Treat your work with grace.", "Find the lesson in the feedback.", "Iterate and grow.", "Keep the ego removed from the red pen.", "Every correction is a redirect to success."]
    },
    doubt: {
        starts: ["Imposter syndrome is just a sign you're growing.", "Doubt kills more dreams than failure.", "You are capable of more than you know.", "Every expert was once a beginner.", "Trust the process."],
        ends: ["Remember how far you've come.", "Acknowledge your competence.", "You belong in this room.", "Keep going despite the fear.", "Your voice matters."]
    },
    reflective: {
        starts: ["The purpose of knowledge is to illuminate the path.", "We learn by reflecting on our experience.", "Pause to see the bigger picture.", "Look back to move forward.", "Every day holds a quiet lesson."],
        ends: ["Write it down.", "Share it with someone.", "Keep the learning loop open.", "Allow yourself the space to wonder.", "Wisdom comes in the silent moments."]
    }
};

const taskSegments = {
    inspired: ["Write down your 3 biggest ideas.", "Draft a quick outline for a new lesson.", "Send an encouraging note to a colleague.", "Spend 5 minutes brainstorming without filters.", "Reorganize your workspace for creativity."],
    focused: ["Set a 25-minute Pomodoro timer.", "Close down all tabs except the one you need.", "Put your phone in another room.", "Pick the hardest task and do it first.", "Clear your desk completely."],
    overwhelmed: ["Do a brain dump: write everything down.", "Pick ONE task and only do that.", "Close your email inbox.", "Take 5 deep breaths.", "Drink a glass of water and stretch."],
    fatigued: ["Step away from the screen for 10 minutes.", "Close your eyes for 2 minutes.", "Listen to a calm song.", "Go for a brief walk.", "Switch to a low-energy task like tidying up."],
    evaluative: ["Review your rubrics without grading.", "Ask a peer for honest feedback.", "Spend 10 minutes solely on editing.", "Celebrate one thing you did well.", "Find a bottleneck and document it."],
    doubt: ["Read a thank you note from a student.", "List 3 things you are proud of.", "Review a past successful project.", "Talk to a supportive colleague.", "Remind yourself of your 'Why'."],
    reflective: ["Journal for 5 minutes.", "Identify one lesson you learned today.", "Write a note to your future self.", "Look out the window and observe.", "Review your term goals."]
};

// Selection of peaceful, educational, or focus-based YouTube videos (IDs)
// Updated using provided links
const videoPools = {
    inspired: [
        "https://www.youtube.com/watch?v=ZXsQAXx_ao0", "https://www.youtube.com/watch?v=mgmVOuLgFB0", "https://www.youtube.com/watch?v=26U_seo0a1g", "https://www.youtube.com/watch?v=wnHW6o8WMas", "https://www.youtube.com/watch?v=jsO8tP4Y3fg", "https://www.youtube.com/watch?v=UNQhuFL6CWg", "https://www.youtube.com/watch?v=8S0FDjFBj8o", "https://www.youtube.com/watch?v=2vjPBrBU-TM", "https://www.youtube.com/watch?v=VbfpW0pbvaU", "https://www.youtube.com/watch?v=IqfViDTsHHo", "https://www.youtube.com/watch?v=arj7oStGLkU", "https://www.youtube.com/watch?v=YTuElM6T50w", "https://www.youtube.com/watch?v=UUnRKf2CemA", "https://www.youtube.com/watch?v=6vuetQSwFW8", "https://www.youtube.com/watch?v=ZbZSe6N_BXs", "https://www.youtube.com/watch?v=pN34FNbOKXc", "https://www.youtube.com/watch?v=H14bBuluwB8", "https://www.youtube.com/watch?v=0uRR72b_qvc", "https://www.youtube.com/watch?v=fLexgOxsZu0", "https://www.youtube.com/watch?v=l-gQLqv9f4o"
    ],
    focused: [
        "https://www.youtube.com/watch?v=wp-6n1sW1s8", "https://www.youtube.com/watch?v=5qap5aO4i9A", "https://www.youtube.com/watch?v=DWcJFNfaw9c", "https://www.youtube.com/watch?v=UfcAVejslrU", "https://www.youtube.com/watch?v=hHW1oY26kxQ", "https://www.youtube.com/watch?v=6p_yaNFSYao", "https://www.youtube.com/watch?v=7NOSDKb0HlU", "https://www.youtube.com/watch?v=1ZYbU82GVz4", "https://www.youtube.com/watch?v=9ZfN87gSjvI", "https://www.youtube.com/watch?v=KxGRhd_iWuE", "https://www.youtube.com/watch?v=Y9k9KX7yqJg", "https://www.youtube.com/watch?v=QH2-TGUlwu4", "https://www.youtube.com/watch?v=V1Pl8CzNzCw", "https://www.youtube.com/watch?v=8ZcmTl_1ER8", "https://www.youtube.com/watch?v=6WhWDCw3Mng", "https://www.youtube.com/watch?v=3FjIuPMQzxo", "https://www.youtube.com/watch?v=JfVOs4VSpmA", "https://www.youtube.com/watch?v=9WgP4u5mK7A", "https://www.youtube.com/watch?v=2OEL4P1Rz04", "https://www.youtube.com/watch?v=4xDzrJKXOOY"
    ],
    overwhelmed: [
        "https://www.youtube.com/watch?v=inpok4MKVLM", "https://www.youtube.com/watch?v=ZToicYcHIOU", "https://www.youtube.com/watch?v=MIr3RsUWrdo", "https://www.youtube.com/watch?v=SEfs5TJZ6Nk", "https://www.youtube.com/watch?v=1vx8iUvfyCY", "https://www.youtube.com/watch?v=6p_yaNFSYao", "https://www.youtube.com/watch?v=O-6f5wQXSu8", "https://www.youtube.com/watch?v=odADwWzHR24", "https://www.youtube.com/watch?v=3XhU9xg3pXg", "https://www.youtube.com/watch?v=nmFUDkj1Aq0", "https://www.youtube.com/watch?v=F28MGLlpP90", "https://www.youtube.com/watch?v=Jyy0ra2WcQQ", "https://www.youtube.com/watch?v=0fL-pn80s-c", "https://www.youtube.com/watch?v=IeblJdB2-Vo", "https://www.youtube.com/watch?v=2n7FOBFMvXg", "https://www.youtube.com/watch?v=ZPniQzV3j9w", "https://www.youtube.com/watch?v=smv4C0Vh2T0", "https://www.youtube.com/watch?v=JZkG6TzWnY0", "https://www.youtube.com/watch?v=hnpQrMqDoqE", "https://www.youtube.com/watch?v=8jPQjjsBbIc"
    ],
    fatigued: [
        "https://www.youtube.com/watch?v=1ZYbU82GVz4", "https://www.youtube.com/watch?v=5qap5aO4i9A", "https://www.youtube.com/watch?v=DWcJFNfaw9c", "https://www.youtube.com/watch?v=UfcAVejslrU", "https://www.youtube.com/watch?v=8ZcmTl_1ER8", "https://www.youtube.com/watch?v=KxGRhd_iWuE", "https://www.youtube.com/watch?v=3FjIuPMQzxo", "https://www.youtube.com/watch?v=6WhWDCw3Mng", "https://www.youtube.com/watch?v=9ZfN87gSjvI", "https://www.youtube.com/watch?v=4xDzrJKXOOY", "https://www.youtube.com/watch?v=QH2-TGUlwu4", "https://www.youtube.com/watch?v=V1Pl8CzNzCw", "https://www.youtube.com/watch?v=2OEL4P1Rz04", "https://www.youtube.com/watch?v=JfVOs4VSpmA", "https://www.youtube.com/watch?v=Y9k9KX7yqJg", "https://www.youtube.com/watch?v=7NOSDKb0HlU", "https://www.youtube.com/watch?v=hHW1oY26kxQ", "https://www.youtube.com/watch?v=wp-6n1sW1s8", "https://www.youtube.com/watch?v=6p_yaNFSYao", "https://www.youtube.com/watch?v=9WgP4u5mK7A"
    ],
    evaluative: [
        "https://www.youtube.com/watch?v=8hly31xKli0", "https://www.youtube.com/watch?v=HnJkqWk0r5M", "https://www.youtube.com/watch?v=rfscVS0vtbw", "https://www.youtube.com/watch?v=ua-CiDNNj30", "https://www.youtube.com/watch?v=Oe421EPjeBE", "https://www.youtube.com/watch?v=RBSGKlAvoiM", "https://www.youtube.com/watch?v=PkZNo7MFNFg", "https://www.youtube.com/watch?v=J---aiyznGQ", "https://www.youtube.com/watch?v=KJgsSFOSQv0", "https://www.youtube.com/watch?v=1Rs2ND1ryYc", "https://www.youtube.com/watch?v=5MgBikgcWnY", "https://www.youtube.com/watch?v=Q33KBiDriJY", "https://www.youtube.com/watch?v=VbfpW0pbvaU", "https://www.youtube.com/watch?v=8jPQjjsBbIc", "https://www.youtube.com/watch?v=YlUKcNNmywk", "https://www.youtube.com/watch?v=3fumBcKC6RE", "https://www.youtube.com/watch?v=OPf0YbXqDm0", "https://www.youtube.com/watch?v=2vjPBrBU-TM", "https://www.youtube.com/watch?v=ZbZSe6N_BXs", "https://www.youtube.com/watch?v=fLexgOxsZu0"
    ],
    doubt: [
        "https://www.youtube.com/watch?v=mgmVOuLgFB0", "https://www.youtube.com/watch?v=ZXsQAXx_ao0", "https://www.youtube.com/watch?v=UNQhuFL6CWg", "https://www.youtube.com/watch?v=wnHW6o8WMas", "https://www.youtube.com/watch?v=jsO8tP4Y3fg", "https://www.youtube.com/watch?v=IqfViDTsHHo", "https://www.youtube.com/watch?v=arj7oStGLkU", "https://www.youtube.com/watch?v=YTuElM6T50w", "https://www.youtube.com/watch?v=UUnRKf2CemA", "https://www.youtube.com/watch?v=6vuetQSwFW8", "https://www.youtube.com/watch?v=ZbZSe6N_BXs", "https://www.youtube.com/watch?v=pN34FNbOKXc", "https://www.youtube.com/watch?v=H14bBuluwB8", "https://www.youtube.com/watch?v=0uRR72b_qvc", "https://www.youtube.com/watch?v=fLexgOxsZu0", "https://www.youtube.com/watch?v=l-gQLqv9f4o", "https://www.youtube.com/watch?v=2vjPBrBU-TM", "https://www.youtube.com/watch?v=VbfpW0pbvaU", "https://www.youtube.com/watch?v=8S0FDjFBj8o", "https://www.youtube.com/watch?v=26U_seo0a1g"
    ],
    reflective: [
        "https://www.youtube.com/watch?v=inpok4MKVLM", "https://www.youtube.com/watch?v=ZToicYcHIOU", "https://www.youtube.com/watch?v=MIr3RsUWrdo", "https://www.youtube.com/watch?v=SEfs5TJZ6Nk", "https://www.youtube.com/watch?v=1vx8iUvfyCY", "https://www.youtube.com/watch?v=O-6f5wQXSu8", "https://www.youtube.com/watch?v=odADwWzHR24", "https://www.youtube.com/watch?v=3XhU9xg3pXg", "https://www.youtube.com/watch?v=nmFUDkj1Aq0", "https://www.youtube.com/watch?v=F28MGLlpP90", "https://www.youtube.com/watch?v=Jyy0ra2WcQQ", "https://www.youtube.com/watch?v=0fL-pn80s-c", "https://www.youtube.com/watch?v=IeblJdB2-Vo", "https://www.youtube.com/watch?v=2n7FOBFMvXg", "https://www.youtube.com/watch?v=ZPniQzV3j9w", "https://www.youtube.com/watch?v=smv4C0Vh2T0", "https://www.youtube.com/watch?v=JZkG6TzWnY0", "https://www.youtube.com/watch?v=hnpQrMqDoqE", "https://www.youtube.com/watch?v=8jPQjjsBbIc", "https://www.youtube.com/watch?v=6p_yaNFSYao"
    ]
};

function generateContent(mood, count = 20) {
    let quotes = [];
    let tasks = [];
    let videos = [];

    const starts = quoteSegments[mood].starts;
    const ends = quoteSegments[mood].ends;
    const taskPool = taskSegments[mood];
    const videoPool = videoPools[mood];

    for (let i = 0; i < count; i++) {
        // AI Dynamic Content Generation
        const quote = `${starts[i % starts.length]} ${ends[Math.floor(Math.random() * ends.length)]}`;
        quotes.push(quote);
        
        // Randomly combine tasks with slight variations
        const baseTask = taskPool[i % taskPool.length];
        const taskModifiers = ["Try this:", "Your next step:", "Right now:", "Take a moment to", "Action step:"];
        tasks.push(`${taskModifiers[Math.floor(Math.random() * taskModifiers.length)]} ${baseTask}`);

        // Cycle through videos and format into embed links
        const rawUrl = videoPool[i % videoPool.length];
        const embedUrl = rawUrl.replace("watch?v=", "embed/") + "?autoplay=0&controls=1";
        videos.push(embedUrl);
    }

    // Shuffle arrays nicely so it feels very random out of the 20
    const shuffle = array => array.sort(() => Math.random() - 0.5);

    return {
        quotes: shuffle(quotes),
        tasks: shuffle(tasks),
        videos: shuffle(videos)
    };
}

// Pre-compute 20 items per mood on load
export const MOOD_DATABASE = {
    inspired: generateContent('inspired', 20),
    focused: generateContent('focused', 20),
    overwhelmed: generateContent('overwhelmed', 20),
    fatigued: generateContent('fatigued', 20),
    evaluative: generateContent('evaluative', 20),
    doubt: generateContent('doubt', 20),
    reflective: generateContent('reflective', 20)
};
