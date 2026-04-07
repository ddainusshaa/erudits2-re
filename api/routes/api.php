<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoundController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\AnswerController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\GameInstanceController;
use App\Http\Controllers\Api\BroadcastController;
use App\Http\Controllers\Api\PlayerAnswerController;
use App\Http\Controllers\Api\BuzzerController;
use App\Http\Controllers\Api\DeployController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/auth/register', [UserController::class, 'createUser'])->middleware('throttle:auth');
Route::post('/auth/login', [UserController::class, 'loginUser'])->middleware('throttle:auth');

Route::post('/join', [GameInstanceController::class, 'join']);
Route::post('/create-player', [PlayerController::class, 'createPlayer']);

Route::get('/round-info/{instance_id}', [GameInstanceController::class, 'roundInfo']);
Route::get('/round-questions/{instance_id}', [GameInstanceController::class, 'roundQuestions']);
Route::get('/current-question/{instance_id}', [GameInstanceController::class, 'currentQuestion']);


Route::post('/player-answers', [PlayerAnswerController::class, 'store']);

Route::post('/buzz', [BuzzerController::class, 'buzz']);


Route::post('/instance-index', [GameInstanceController::class, 'indexWithPlayerInfo']);

Route::post('/player-finish-round', [PlayerController::class, 'finishRound']);

Route::get('/ping', [BroadcastController::class, 'ping']);

Route::get('/player/{id}', [PlayerController::class, 'show']);
Route::post('/player-ping', [PlayerController::class, 'ping']);
Route::post('/player-devtools', [PlayerController::class, 'devtools']);

Route::get('/version', function () {
    return response()->json([
        'version' => trim(file_get_contents(base_path('version.txt')))
    ]);
});

Route::group(['middleware' => 'auth:sanctum'], function() {

    Route::post('/auth/logout', [UserController::class, 'logout']);

    //games
    Route::apiResource('/games', GameController::class);
    Route::get('/create-game', [GameController::class, 'create']);
    Route::get('/game-sidebar/{game_id}', [GameController::class, 'sidebar']);
    Route::get('/full-game/{game_id}', [GameController::class, 'fullIndex']);
    Route::post('/duplicate-game/{game_id}', [GameController::class, 'duplicate']);

    //rounds
    Route::apiResource('/rounds', RoundController::class);
    Route::get('/create-round/{game_id}', [RoundController::class, 'create']);
    Route::get('/gamerounds/{game_id}', [RoundController::class, 'roundsByGame']);

    //questions
    Route::apiResource('/questions', QuestionController::class);
    Route::get('/create-question/{round_id}', [QuestionController::class, 'create']);
    Route::post('/question-image/{question_id}', [QuestionController::class, 'uploadImage']);

    //answers
    Route::delete('/answers/{answer_id}', [AnswerController::class, 'destroy']);
    Route::get('/create-answer/{question_id}', [AnswerController::class, 'create']);

    //game-instances
    Route::post('/activate', [GameInstanceController::class, 'activate']);
    Route::get('/status/{game_id}', [GameInstanceController::class, 'status']);
    Route::get('/instance-game/{instance_id}', [GameInstanceController::class, 'instanceGame']);
    Route::get('/game-controller-info/{instance_id}', [GameInstanceController::class, 'questionInfo']);

    Route::post('/next-round', [GameInstanceController::class, 'nextRound']);
    Route::post('/previous-round', [GameInstanceController::class, 'previousRound']);
    Route::post('/next-question', [GameInstanceController::class, 'nextQuestion']);
    Route::post('/previous-question', [GameInstanceController::class, 'previousQuestion']);

    Route::post('/game-control', [GameInstanceController::class, 'gameControl']);

    //players
    Route::get('/players/{instance_id}', [PlayerController::class, 'index']);
    Route::post('/disqualify-player', [PlayerController::class, 'disqualify']);
    Route::post('/requalify-player', [PlayerController::class, 'requalify']);
    Route::delete('/players/{ids}', [PlayerController::class, 'destroy']);
    Route::post('/adjust-points', [PlayerController::class, 'adjustPoints']);

    //player-answers
    Route::get('/player-answers/{gameInstanceId}', [PlayerAnswerController::class, 'getInstanceAnswers']);
    Route::put('/player-answers', [PlayerAnswerController::class, 'update']);

    Route::post('/tiebreak', [GameInstanceController::class, 'tiebreak']);

    //buzzer
    Route::post('/buzzer-start', [BuzzerController::class, 'initialize']);
    Route::post('/buzzer-stop', [BuzzerController::class, 'deinitialize']);
    Route::post('/buzzer-clear', [BuzzerController::class, 'deactivateAll']);
    Route::get('/buzzers/{instance_id}', [BuzzerController::class, 'getInstanceBuzzers']);
    Route::post('/buzzers-toggle', [BuzzerController::class, 'toggleBuzzers']);

    // PLAYERS
    // Route::get('/players', [PlayerController::class, 'get']);
    // Route::post('/delete-players', [PlayerController::class, 'destroy']);
    // Route::post('/disqualify-players', [PlayerController::class, 'disqualify']);
    // Route::post('/requalify-players', [PlayerController::class, 'requalify']);
    // Route::post('/adjust-points', [PlayerController::class, 'adjustPoints']);

});



