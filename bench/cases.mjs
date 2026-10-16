// refs: acceptable corrections; empty refs => text is already correct and must come back unchanged
export const proofreading = [
  // English, errors
  {
    lang: "en",
    input: "Their going too the store tomorow, and they has alot of things to by.",
    refs: ["They're going to the store tomorrow, and they have a lot of things to buy."],
  },
  {
    lang: "en",
    input: "I didnt knew that the meeting have been moved, can you sent me the new invite?",
    refs: [
      "I didn't know that the meeting had been moved, can you send me the new invite?",
      "I didn't know that the meeting had been moved. Can you send me the new invite?",
      "I didn't know that the meeting had been moved; can you send me the new invite?",
    ],
  },
  {
    lang: "en",
    input: "This PR fix the bug where user cant login when there password contain special charakters.",
    refs: [
      "This PR fixes the bug where users can't log in when their password contains special characters.",
      "This PR fixes the bug where users can't log in when their passwords contain special characters.",
      "This PR fixes the bug where a user can't log in when their password contains special characters.",
      "This PR fixes the bug where the user can't log in when their password contains special characters.",
    ],
  },
  {
    lang: "en",
    input: "The data shows that less people is using the old API since we deprecated it.",
    refs: ["The data shows that fewer people are using the old API since we deprecated it."],
  },
  {
    lang: "en",
    input: "Could you please review my changes, I think its ready to merge.",
    refs: [
      "Could you please review my changes? I think it's ready to merge.",
      "Could you please review my changes, I think it's ready to merge.",
      "Could you please review my changes; I think it's ready to merge.",
    ],
  },
  {
    lang: "en",
    input: "We should of tested this before deploying it to production.",
    refs: ["We should have tested this before deploying it to production."],
  },
  {
    lang: "en",
    input: "The new endpoint returns an list of claims wich are eligable for compensation.",
    refs: [
      "The new endpoint returns a list of claims which are eligible for compensation.",
      "The new endpoint returns a list of claims that are eligible for compensation.",
    ],
  },
  {
    lang: "en",
    input: "Everyone have their own opinion about this approach.",
    refs: ["Everyone has their own opinion about this approach."],
  },
  {
    lang: "en",
    input: "I have went through the logs and I found nothing suspicious.",
    refs: [
      "I have gone through the logs and I found nothing suspicious.",
      "I went through the logs and I found nothing suspicious.",
    ],
  },
  {
    lang: "en",
    input: "Its important to recieve the confirmation before procceding.",
    refs: ["It's important to receive the confirmation before proceeding."],
  },
  {
    lang: "en",
    input: "The tests was failing because the database were not seeded.",
    refs: ["The tests were failing because the database was not seeded."],
  },
  {
    lang: "en",
    input: "Lets discuss it on tomorrows standup.",
    refs: [
      "Let's discuss it on tomorrow's standup.",
      "Let's discuss it at tomorrow's standup.",
      "Let's discuss it in tomorrow's standup.",
    ],
  },
  {
    lang: "en",
    input: "Thank's for you're help, I really appreciate it.",
    refs: ["Thanks for your help, I really appreciate it.", "Thanks for your help. I really appreciate it."],
  },
  {
    lang: "en",
    input: "Run `make test` before you pushs, otherwise the CI will fails.",
    refs: [
      "Run `make test` before you push, otherwise the CI will fail.",
      "Run `make test` before you push; otherwise the CI will fail.",
      "Run `make test` before you push, otherwise CI will fail.",
    ],
  },
  {
    lang: "en",
    input: "The `getSelectedText()` function throw an error when nothing are selected.",
    refs: ["The `getSelectedText()` function throws an error when nothing is selected."],
  },
  {
    lang: "en",
    input: "- fix the login bug\n- updated the readme file\n- add test's for the parser",
    refs: [
      "- fix the login bug\n- updated the readme file\n- add tests for the parser",
      "- fix the login bug\n- update the readme file\n- add tests for the parser",
    ],
  },
  // English, already correct
  { lang: "en", input: "The deployment finished successfully, and all health checks are green.", refs: [] },
  { lang: "en", input: "Please take a look at the attached screenshot when you have a moment.", refs: [] },
  { lang: "en", input: "I'll be out of office on Friday, so let's sync on Thursday instead.", refs: [] },
  { lang: "en", input: "We decided to keep the current schema and revisit it next quarter.", refs: [] },
  { lang: "en", input: "lgtm, ship it 🚀", refs: [] },
  { lang: "en", input: "Use `npm run dev` to start the extension in development mode.", refs: [] },
  // Polish, errors
  {
    lang: "pl",
    input: "Wczoraj poszłem do sklepu i kupiłem chleb.",
    refs: ["Wczoraj poszedłem do sklepu i kupiłem chleb."],
  },
  {
    lang: "pl",
    input: "Nie wiem czy dam rade przyjść na spotkanie.",
    refs: ["Nie wiem, czy dam radę przyjść na spotkanie."],
  },
  { lang: "pl", input: "Prosze o przeslanie raportu do piatku.", refs: ["Proszę o przesłanie raportu do piątku."] },
  {
    lang: "pl",
    input: "Wziąść udział w tym projekcie było dla mnie dużym wyzwaniem.",
    refs: ["Wziąć udział w tym projekcie było dla mnie dużym wyzwaniem."],
  },
  {
    lang: "pl",
    input: "W każdym bądź razie musimy to skończyć do poniedziałku.",
    refs: [
      "W każdym razie musimy to skończyć do poniedziałku.",
      "W każdym bądź razie musimy to skończyć do poniedziałku.",
    ],
  },
  {
    lang: "pl",
    input: "Sprawdziłem logi i nie znalazłem żadnych błedów.",
    refs: ["Sprawdziłem logi i nie znalazłem żadnych błędów."],
  },
  {
    lang: "pl",
    input: "Daj mi znać jak skończysz review tego PR.",
    refs: ["Daj mi znać, jak skończysz review tego PR.", "Daj mi znać, jak skończysz review tego PR-a."],
  },
  // Polish, already correct
  { lang: "pl", input: "Wczoraj poszedłem do sklepu i kupiłem chleb, mleko i jajka.", refs: [] },
  { lang: "pl", input: "Daj znać, jeśli będziesz potrzebować pomocy przy wdrożeniu.", refs: [] },
  { lang: "pl", input: "Spotkanie zostało przeniesione na czwartek o godzinie 10.", refs: [] },
  { lang: "pl", input: "Zrobiłem deploy na staging, ale testy e2e nie przechodzą.", refs: [] },
  { lang: "pl", input: "Dzięki, wszystko działa 👍", refs: [] },
];

export const tense = [
  {
    lang: "en",
    input: "Tomorrow i was in the shop",
    refs: ["Tomorrow I will be in the shop", "Tomorrow I'll be in the shop"],
  },
  { lang: "en", input: "Yesterday I will go to the gym.", refs: ["Yesterday I went to the gym."] },
  {
    lang: "en",
    input: "Next week we deployed the fix.",
    refs: ["Next week we will deploy the fix.", "Next week we'll deploy the fix."],
  },
  {
    lang: "en",
    input: "Last year she is working at Google.",
    refs: ["Last year she was working at Google.", "Last year she worked at Google."],
  },
  { lang: "en", input: "Two days ago the build fails on main.", refs: ["Two days ago the build failed on main."] },
  {
    lang: "en",
    input: "Tomorrow we had a retro with the whole team.",
    refs: ["Tomorrow we will have a retro with the whole team.", "Tomorrow we'll have a retro with the whole team."],
  },
  { lang: "en", input: "Yesterday I went to the shop and bought milk.", refs: [] },
  { lang: "en", input: "Tomorrow I will review your PR.", refs: [] },
  { lang: "en", input: "Last week we migrated the database to Postgres 17.", refs: [] },
];
