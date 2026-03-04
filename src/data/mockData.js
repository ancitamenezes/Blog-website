export const MOCK_USER = {
    id: "u1",
    username: "alex_dev",
    name: "Alex Developer",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    bio: "Frontend Wizard | Speaker | Open Source Enthusiast",
    techStack: ["React", "TypeScript", "GSAP", "Tailwind"],
    followers: 1245,
    following: 340,
};

export const MOCK_POSTS = [
    {
        id: "p1",
        author: {
            name: "Sarah Chen",
            username: "sarahcodes",
            avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        },
        title: "Why you should stop using generic CSS",
        snippet: "A deep dive into building design systems that actually scale. Tailwind v4 changes everything we know about utility classes...",
        coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070",
        tags: ["CSS", "Design"],
        likes: 342,
        comments: 45,
        createdAt: "2h ago",
    },
    {
        id: "p2",
        author: {
            name: "Alex Developer",
            username: "alex_dev",
            avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        },
        title: "Mastering Scroll Animations with GSAP",
        snippet: "Pinning elements, timeline scrubs, and making your landing page feel like a movie. Let's build something beautiful.",
        coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070",
        tags: ["GSAP", "React", "Animation"],
        likes: 890,
        comments: 112,
        createdAt: "5h ago",
    },
    {
        id: "p3",
        author: {
            name: "Jordan Lee",
            username: "jlee_tech",
            avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
        },
        title: "The Architecture of Modern Web Apps",
        snippet: "How we structured our monolithic app to micro-frontends and why you probably shouldn't do it unless you have 100+ devs.",
        coverImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=1974",
        tags: ["Architecture", "Scaling"],
        likes: 124,
        comments: 23,
        createdAt: "1d ago",
    }
];
