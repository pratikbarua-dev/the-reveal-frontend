const fs = require('fs');
const path = require('path');

const positions = [
  {
    headline: "69 Plus One",
    description: "The 69ers lie facing each other, but with their heads in one another's crotches, with one partner on the edge of the bed. While the first two partners orally pleasure each other, the third partner approaches from behind for anal or vaginal play.",
    keywords: ["threesome", "group play", "69 sex position", "oral sex", "anal play"],
    image_url: "/images/group_play/group_play_1.png",
    url: "https://www.womenshealthmag.com/sex-and-love/a19994724/threesome-sex-positions/"
  },
  {
    headline: "Shared Oral",
    description: "Sharing is caring. Two receiving partners lie on their backs next to each other while the third partner (the giver) takes turns going down on them. The receiving partners can use their hands on each other while waiting their turn.",
    keywords: ["threesome", "group play", "oral sex", "cunnilingus", "blowjob", "clitoral"],
    image_url: "/images/group_play/group_play_2.png",
    url: "https://www.womenshealthmag.com/sex-and-love/a19994724/threesome-sex-positions/"
  },
  {
    headline: "Shower Pleasure",
    description: "Take your threesome into the shower and take turns soaping one another up. The receiving partner can lean against the shower wall while the other four hands and two mouths explore.",
    keywords: ["threesome", "group play", "standing", "shower", "water play"],
    image_url: "/images/group_play/group_play_3.png",
    url: "https://www.womenshealthmag.com/sex-and-love/a19994724/threesome-sex-positions/"
  },
  {
    headline: "Oral-Penetrative Train",
    description: "The first partner penetrates a second partner who is giving oral to a third partner. Alternatively, one partner bends over the bed while being penetrated from behind, and giving oral to the third partner lying in front.",
    keywords: ["threesome", "group play", "oral sex", "from behind", "multi-tasking"],
    image_url: "/images/group_play/group_play_4.png",
    url: "https://www.womenshealthmag.com/sex-and-love/a19994724/threesome-sex-positions/"
  },
  {
    headline: "Three-Way Spoon",
    description: "All partners lie on their sides and get into a spooning position. Two people penetrate the person in front of them. The hands are free to roam all over each other, enhancing the sensations.",
    keywords: ["threesome", "group play", "lying down", "spooning", "sensual"],
    image_url: "/images/group_play/group_play_5.png",
    url: "https://www.womenshealthmag.com/sex-and-love/a19994724/threesome-sex-positions/"
  },
  {
    headline: "Virtual Threesome",
    description: "Two partners sit in front of the screen while playing with a partner who is elsewhere. You can give one another directions, put on a show, or play from afar with a remote-control vibrator.",
    keywords: ["threesome", "voyeurism", "exhibitionism", "camming", "long distance"],
    image_url: "/images/group_play/group_play_6.png",
    url: "https://www.womenshealthmag.com/sex-and-love/a19994724/threesome-sex-positions/"
  },
  {
    headline: "Penetration + Stimulation",
    description: "The first partner penetrates the second partner, while the third partner strokes the erogenous zones on their fellow participants, focusing on nipple play, clitoral stimulation, or kissing.",
    keywords: ["threesome", "group play", "clitoral", "nipple play", "teasing"],
    image_url: "/images/group_play/group_play_7.png",
    url: "https://www.womenshealthmag.com/sex-and-love/a19994724/threesome-sex-positions/"
  },
  {
    headline: "Double Penetration",
    description: "Someone is penetrated vaginally and anally at the same time, by two different partners. The receiver can climb on top and ride the giving partner while the second penetrating partner enters anally from behind.",
    keywords: ["threesome", "group play", "double penetration", "hard", "crazy", "anal sex", "vaginal sex"],
    image_url: "/images/group_play/group_play_8.png",
    url: "https://www.womenshealthmag.com/sex-and-love/a19994724/threesome-sex-positions/"
  },
  {
    headline: "Daisy Chain",
    description: "Each participant lies on their side with their face at their neighbor's crotch, forming a circle. Everyone performs oral sex on the person in front of them simultaneously.",
    keywords: ["threesome", "group play", "oral sex", "mutual stimulation", "lying down"],
    image_url: "/images/group_play/group_play_9.png",
    url: "https://www.womenshealthmag.com/sex-and-love/a19994724/threesome-sex-positions/"
  },
  {
    headline: "Double Oral",
    description: "One person takes the shaft while the other sucks on the testes, both can lick at once, or you can take turns. A highly attentive oral experience for one partner.",
    keywords: ["threesome", "group play", "oral sex", "blowjob", "praise kink"],
    image_url: "/images/group_play/group_play_10.png",
    url: "https://www.womenshealthmag.com/sex-and-love/a19994724/threesome-sex-positions/"
  },
  {
    headline: "The Eiffel Tower",
    description: "The first partner assumes doggy-style position while performing oral sex on the second partner; meanwhile, the third partner penetrates the first partner from behind. High fives across the top optional.",
    keywords: ["threesome", "group play", "doggy style", "oral sex", "from behind", "crazy"],
    image_url: "/images/group_play/group_play_11.png",
    url: "https://www.womenshealthmag.com/sex-and-love/a19994724/threesome-sex-positions/"
  }
];

const dest = path.join(__dirname, 'sexpositions', 'group-positions.json');
fs.writeFileSync(dest, JSON.stringify(positions, null, 2));
console.log(`Saved ${positions.length} positions to ${dest}`);
