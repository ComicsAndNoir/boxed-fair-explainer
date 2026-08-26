/**
 * Faithful reproduction of the real text content from Boxed.GG's own Help
 * Center article, extracted from existing_explainer/boxed_gg_provably_fair.html
 * (a full page save the user captured from the live site). Not paraphrased —
 * this is Boxed's actual copy, used as the honest baseline for Variant A of
 * the A/B test. See ARCHITECTURE.md §6 for how this feeds VariantAArticle.
 */

interface FaqItem {
  question: string;
  answer: string;
}

interface SubSection {
  heading: string;
  text: string;
}

interface VerifyStep {
  title: string;
  text: string;
}

export const EXISTING_EXPLAINER = {
  title: "Provably Fair",
  subtitle: "How the provably fair system works and how to verify any box open, battle, or game outcome yourself.",
  intro:
    "Provably fair is a cryptographic system that lets you independently verify that every outcome on BOXED was randomly generated and not manipulated. This article explains how it works and walks you through verifying an outcome yourself.",
  tldr: "Every outcome on BOXED is generated from four values: your client seed, our server seed, a nonce, and a salt. We publish a hash of the server seed before you play and reveal the actual server seed afterward, so you can confirm the result was decided before you opened anything. You can verify any outcome from your game history. Provably fair covers box opens, battles, and all games including Hop or Drop.",
  whatItMeans: [
    "Provably fair is a technology based approach that can be independently analyzed and tested. In plain terms, it means you can cryptographically verify that every item you receive was selected at random by an algorithm, rather than chosen after the fact.",
    "This applies to every experience on BOXED, including box opens, Box Battles, vending machines, Forge boxes, and Hop or Drop.",
  ],
  howItWorksIntro: [
    "Each outcome generates a number between 0 and 999,999. That number maps to a range, and the range determines which item you receive.",
    "Four values are combined to generate that number:",
  ],
  values: [
    {
      heading: "Client seed",
      text: "Your client seed is a value you control. You can change it at any time using the provably fair button on any box page. If you want to change how your outcomes are generated, give yourself a new client seed. We never modify this value.",
    },
    {
      heading: "Server seed",
      text: "The server seed is a secret phrase stored on our side and used to generate your outcome. It is not shown at the time you play. Instead we show a hash of the server seed, and the actual server seed is revealed 24 hours later. A hash works like a scrambling function that always produces the same result from the same input. Because we give you the hash before you play and reveal the seed afterward, you can confirm that the seed we revealed is the one that was actually used.",
    },
    {
      heading: "Nonce",
      text: "The nonce is a number attached to your account that increases with every outcome, so no two outcomes use the same combination of values.",
    },
    {
      heading: "Salt",
      text: "The salt is a permanent random phrase attached to your account that adds an additional layer of randomness.",
    },
  ] satisfies SubSection[],
  puttingItTogether:
    "These four values are combined to generate a cryptographic hex string. That string is converted into a number, and that number becomes the result ticket that determines your item.",
  verifySteps: [
    {
      title: "Step 1: Open your game history",
      text: "Go to the game history page in your account and select View on the outcome you want to verify.",
    },
    {
      title: "Step 2: Check whether the server seed has been revealed",
      text: 'Scroll down to where the server seed is shown. If it says "The server seed has not been revealed yet," you will need to wait up to 24 hours before you can verify that outcome.',
    },
    {
      title: "Step 3: Enter your values into the verification tool",
      text: "Open the verification sandbox and copy your client seed, server seed, nonce, and salt into the variable definitions in the code, as shown below.",
    },
    {
      title: "Step 4: Run it and read the console",
      text: "View the console window in the sandbox. The console confirms that the server hash provided matches the server seed for that outcome, and it also produces the result ticket.",
    },
    {
      title: "Step 5: Compare the result",
      text: "Return to the outcome details in your game history and scroll to the outcome section. The number shown there should match the number generated in the sandbox. If they match, the outcome is verified.",
    },
  ] satisfies VerifyStep[],
  faq: [
    {
      question: "Can I verify a Box Battle or a Hop or Drop round?",
      answer:
        "Yes, you can verify a Box Battle or a Hop or Drop round. Provably fair covers every experience on BOXED, including box opens, Box Battles, vending machines, Forge boxes, and Hop or Drop. You can verify any of them from your game history using the same steps above.",
    },
    {
      question: "Why can't I see the server seed for my most recent outcome?",
      answer:
        "You cannot see the server seed for your most recent outcome because the server seed for a given period is revealed 24 hours after it is used. If your outcome is recent, the seed will show as not yet revealed. Wait up to 24 hours and the value will appear, at which point you can verify the outcome.",
    },
    {
      question: "Can I change my client seed?",
      answer:
        "Yes, you can change your client seed at any time using the provably fair button on any box page. Setting a new client seed changes how future outcomes are generated. We never modify your client seed.",
    },
    {
      question: "What if the numbers don't match?",
      answer:
        "If the result ticket from the sandbox does not match the outcome shown in your game history, please ask to speak to a human and include the specific outcome you were verifying along with the values you used. Our team will look into it.",
    },
    {
      question: "Does changing my client seed improve my chances?",
      answer:
        "No, changing your client seed does not improve your chances. It changes how outcomes are generated but does not affect the item chances of any box. The drop rates shown on each box page stay the same regardless of your seed.",
    },
  ] satisfies FaqItem[],
};
