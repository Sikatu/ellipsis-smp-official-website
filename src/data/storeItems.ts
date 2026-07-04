export const crates = [
    {
        name: "MonsterHunter Pineapple KPOP Crate",
        image: "/crates/monsterhunter-kpop.webp",
        options: [
            { keys: "1 key", price: "PHP 59" },
            { keys: "3 keys", price: "PHP 149" },
            { keys: "5 keys", price: "PHP 249" },
            { keys: "10 keys", price: "PHP 499" },
        ],
    },
    {
        name: "Stellar Vanguard Crate",
        image: "/crates/stellar-vanguard.webp",
        options: [
            { keys: "1 key", price: "PHP 69" },
            { keys: "3 keys", price: "PHP 179" },
            { keys: "5 keys", price: "PHP 299" },
            { keys: "10 keys", price: "PHP 579" },
        ],
    },
    {
        name: "Phoenix Mecha Sovereign Crate",
        image: "/crates/phoenix-mecha.webp",
        options: [
            { keys: "1 key", price: "PHP 79" },
            { keys: "3 keys", price: "PHP 219" },
            { keys: "5 keys", price: "PHP 349" },
            { keys: "10 keys", price: "PHP 679" },
        ],
    },
    {
        name: "Mariposa Requiem Crate",
        image: "/crates/mariposa-requiem.webp",
        options: [
            { keys: "1 key", price: "PHP 79" },
            { keys: "3 keys", price: "PHP 219" },
            { keys: "5 keys", price: "PHP 349" },
            { keys: "10 keys", price: "PHP 679" },
        ],
    },
];

export const furniture = {
    title: "Furniture Packs",
    price: "PHP 50 = 10 Ellipsis Coins",
    description:
        "Decorate your base with themed furniture sets, base decoration items, seasonal releases, and limited collectible furniture.",
    includes: [
        "Decorative furniture",
        "Themed furniture sets",
        "Base decoration items",
        "Seasonal furniture releases",
        "Limited collectible furniture",
    ],
    bestFor:
        "Builders, decorators, and players who want their base to feel more alive and unique.",
    obtain:
        "Furniture can be obtained using Ellipsis Coins from the vending machine or through store purchase.",
    reminder: "You can check them by doing /warp trades.",
    disclaimer: "Some furniture may have technical issues for Bedrock players.",
    howToBuy:
        "Open a store ticket in Discord and select the Buy/Donate button.",
    packs: [
        {
            name: "Cherry Blossom Pack",
            image: "/furniture/cherry-blossom.webp",
            description: "Soft pink sakura-inspired furniture for peaceful builds.",
        },
        {
            name: "Bedroom Pack",
            image: "/furniture/bedroom.webp",
            description: "Cozy bedroom furniture for homes, hotels, and bases.",
        },
        {
            name: "Japanese Street Pack",
            image: "/furniture/japanese-street.webp",
            description: "Street-style decorations inspired by Japanese city builds.",
        },
        {
            name: "Sci-Fi Pack",
            image: "/furniture/scifi-pack.webp",
            description: "Futuristic furniture for labs, ships, and tech bases.",
        },
        {
            name: "Chinese Pack",
            image: "/furniture/chinese-pack.webp",
            description: "Traditional decorative furniture for elegant themed builds.",
        },
        {
            name: "Aquatic Pack",
            image: "/furniture/aquatic-pack.webp",
            description: "Ocean-themed furniture for aquatic bases and resorts.",
        },
        {
            name: "Gym Pack",
            image: "/furniture/gym-pack.webp",
            description: "Fitness-themed furniture for gyms and modern builds.",
        },
    ],
};

export const plushies = {
    title: "Nog's Plushies Megapack",
    price: "PHP 50 = 5 Plushie Keys",
    image: "/plushies/nogs-megapack.webp",
    description:
        "Decorate your world with collectible plushies from Volumes I-VII, bonus variants, and the MEGA Pack.",
    includes: ["Collectible plushies", "Volumes I-VII + Bonus Variants MEGA Pack"],
    bestFor:
        "Collectors and players who love cute cosmetic decorations for their base.",
    obtain:
        "Plushies can be obtained the same way as furniture, but instead of using Ellipsis Coins, you will need to obtain a Plushie Key from the yellow vendo machine.",
    important:
        "Some plushies may not be visible to Bedrock players depending on resource pack and client support.",
    reminder: "You can check them by doing /warp trades.",
    howToBuy:
        "Open a store ticket in Discord and select the Buy/Donate button.",
};
