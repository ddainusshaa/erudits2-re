export const localization = {
  lv: {
    errors: {
      emailExists: "Lietotājs ar šādu e-pastu jau eksistē.",
      passwordConfirmation: "Ievadītās paroles nesakrīt.",
      emailRequired: "E-pasta lauks ir obligāts.",
      passwordRequired: "Paroles lauks ir obligāts.",
      invalidCredentials: "Nepareizi ievadīts e-pasts vai parole.",
      titleRequired: "Virsraksta lauks ir obligāts.",
      disqualifyAmountRequired: "Diskvalificēto skaita lauks ir obligāts.",
      pointAmountRequired: "Punktu skaita lauks ir obligāts.",
      answerTimeRequired: "Atbildes laika lauks ir obligāts.",
      notAuthorized: "Nepietiekamas tiesības.",
      codeInUse: "Šis kods jau tiek izmantots citā instancē.",
      notEnoughPlayers: "Nav pietiekams spēlētāju skaits.",
      noQuestionId: "Jautājuma ID ir obligāts.",
      indexingGames: "Kļūda indeksējot spēles.",
      gameNotFound: "Spēle nav atrasta.",
      duplicatingGame: "Kļūda dublējot spēli.",
      indexingInstances: "Kļūda indeksējot spēles instances.",
      indexingInstancesWithPlayerInfo:
        "Kļūda indeksējot spēles instances ar spēlētāju informāciju.",
      instanceActive: "Spēles instance jau ir aktīva.",
      activatingInstance: "Kļūda aktivizējot spēles instanci.",
      instanceNotFound: "Spēles instance nav atrasta.",
      invalidCode: "Nederīgs kods.",
      gameAlreadyStarted: "Spēle jau ir sākusies.",
      playerDisqualified: "Spēlētājs diskvalificēts.",
      playerNameRequired: "Spēlētāja nosaukums ir obligāts.",
      playerNameTooLong: "Spēlētāja nosaukums ir pārāk garš (maks. 16 simboli).",
      joiningInstance: "Kļūda pievienojoties spēles instancei.",
      gettingQuestionInfo: "Kļūda iegūstot jautājuma informāciju.",
      noMoreRounds: "Nav vairs kārtu.",
      startingNextRound: "Kļūda sākot nākamo kārtu.",
      startingPreviousRound: "Kļūda sākot iepriekšējo kārtu.",
      noMoreQuestions: "Nav vairs jautājumu.",
      startingNextQuestion: "Kļūda sākot nākamo jautājumu.",
      startingPreviousQuestion: "Kļūda sākot iepriekšējo jautājumu.",
      executingGameControlCommand: "Kļūda izpildot spēles vadības komandu.",
      noTiebreakRound: "Nav papildkārtas.",
      startingTiebreak: "Kļūda sākot papildkārtu.",
    },
    success: {
      gameCreated: "Spēle veiksmīgi izveidota.",
      roundCreated: "Kārta veiksmīgi izveidota.",
      gameSaved: "Spēle veiksmīgi saglabāta.",
      userCreated: "Lietotājs veiksmīgi piereģistrēts.",
      userLoggedIn: "Ienākšana veiksmīga.",
      roundSaved: "Kārta veiksmīgi saglabāta.",
      gameActivated: "Spēles instance veiksmīgi izveidota.",
      gameDeleted: "Spēle veiksmīgi izdzēsta.",
      gameDuplicated: "Spēle veiksmīgi dublēta.",
      instanceFound: "Spēles instance atrasta.",
      nextRoundStarted: "Nākamā kārta sākta.",
      prevRoundStarted: "Iepriekšējā kārta sākta.",
      nextQuestionStarted: "Nākamais jautājums sākts.",
      prevQuestionStarted: "Iepriekšējais jautājums sākts.",
      tiebreakStarted: "Papildkārta sākta.",
      imageUploaded: "Attēls veiksmīgi augšupielādēts.",
    },
  },
  en: {
    errors: {
      emailExists: "The email has already been taken.",
      passwordConfirmation: "The password field confirmation does not match.",
      emailRequired: "The email field is required.",
      passwordRequired: "The password field is required.",
      invalidCredentials: "Invalid credentials.",
      titleRequired: "The title field is required.",
      disqualifyAmountRequired: "The disqualify amount field is required.",
      pointAmountRequired: "The points field is required.",
      answerTimeRequired: "The answer time field is required.",
      notAuthorized: "You are not authorized to perform this action.",
      codeInUse: "Code already in use.",
      notEnoughPlayers: "Not enough players to start game",
      noQuestionId: "Question ID is required.",
      indexingGames: "Error while indexing games.",
      gameNotFound: "Game not found.",
      duplicatingGame: "Error duplicating game.",
      indexingInstances: "Error in indexing game instances",
      indexingInstancesWithPlayerInfo:
        "Error in indexing game instances with player info",
      instanceActive: "Game instance already active.",
      activatingInstance: "Error in activating game instance",
      instanceNotFound: "Spēles instance nav atrasta.",
      invalidCode: "Invalid code.",
      gameAlreadyStarted: "Game already started",
      playerDisqualified: "Player disqualified",
      playerNameRequired: "Player name is required.",
      playerNameTooLong: "Player name is too long.",
      joiningInstance: "Error in joining game instance",
      gettingQuestionInfo: "Error in getting question info",
      noMoreRounds: "No more rounds.",
      startingNextRound: "Error in starting next round",
      startingPreviousRound: "Error in starting previous round",
      noMoreQuestions: "No more questions.",
      startingNextQuestion: "Error in starting next question",
      startingPreviousQuestion: "Error in starting previous question",
      executingGameControlCommand: "Error in executing game control command",
      noTiebreakRound: "No tiebreak round.",
      startingTiebreak: "Error in starting tiebreak",
    },
    success: {
      gameCreated: "Game successfully created.",
      roundCreated: "Round successfully created.",
      gameSaved: "Game successfully saved.",
      userCreated: "User successfully registered.",
      userLoggedIn: "Login successful.",
      roundSaved: "Round successfully saved.",
      gameActivated: "Game instance successfully created.",
      gameDeleted: "Game successfully deleted.",
      gameDuplicated: "Game successfully duplicated.",
      instanceFound: "Game instance found.",
      nextRoundStarted: "Next round started.",
      prevRoundStarted: "Previous round started.",
      nextQuestionStarted: "Next question started.",
      prevQuestionStarted: "Previous question started.",
      tiebreakStarted: "Tiebreak started.",
      imageUploaded: "Image uploaded successfully.",
    },
  },
};

export const localizeError = (message: any) => {
  const enErrors = localization.en.errors;
  const lvErrors = localization.lv.errors;

  const errorKey = (Object.keys(enErrors) as (keyof typeof enErrors)[]).find(
    (key) => enErrors[key] === message
  );

  if (errorKey && lvErrors[errorKey]) {
    return lvErrors[errorKey];
  }

  return message;
};

export const localizeSuccess = (message: any) => {
  const enSuccess = localization.en.success;
  const lvSuccess = localization.lv.success;

  const successKey = (
    Object.keys(enSuccess) as (keyof typeof enSuccess)[]
  ).find((key) => enSuccess[key] === message);

  if (successKey && lvSuccess[successKey]) {
    return lvSuccess[successKey];
  }

  return message;
};
