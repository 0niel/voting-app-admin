export enum PollDisplayMode {
  // По умолчанию. Показывает количество голосов за каждый вариант ответа.
  default = "default",

  // Не показывает кол-во голосов за вариант ответа, но показывает количество проголосовавших в общем.
  only_votes_count = "only_votes_count",

  // Открытое голосование. Показывает не только голоса за вариант ответов, но и кто проголосовал.
  show_voters = "show_voters",
}
