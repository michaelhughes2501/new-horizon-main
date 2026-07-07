const STARTERS = [
  "What's a goal you're working toward this year?",
  "What's your favorite way to spend a free weekend?",
  "What inspired you to join New Horizon?",
  "What's one accomplishment you're most proud of?",
  "If you could learn any new skill, what would it be?",
];

export function getConversationStarter(): string {
  return STARTERS[Math.floor(Math.random() * STARTERS.length)];
}
