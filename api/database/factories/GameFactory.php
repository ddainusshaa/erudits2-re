<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Game;
use App\Models\Round;
use App\Models\Question;
use App\Models\Answer;

class GameFactory extends Factory
{
    protected $model = Game::class;

    public function definition()
    {
        return [
            'id' => Str::uuid(),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'user_id' => 'f91bcd4e-55ce-4203-9cd5-cefd90400f73',
        ];
    }
}

class RoundFactory extends Factory
{
    protected $model = Round::class;

    public function definition()
    {
        return [
            'id' => Str::uuid(),
            'title' => $this->faker->sentence(2),
            'disqualify_amount' => $this->faker->numberBetween(1, 4),
            'answer_time' => $this->faker->numberBetween(30, 60),
            'points' => $this->faker->numberBetween(1, 6),
            'is_additional' => false,
            'game_id' => null,
            'order' => null,
        ];
    }
}

class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition()
    {
        return [
            'id' => Str::uuid(),
            'title' => $this->faker->sentence(5),
            'is_text_answer' => false,
            'round_id' => null,
            'guidelines' => $this->faker->sentence(),
            'image_url' => $this->faker->imageUrl(),
            'order' => null,
        ];
    }
}

class AnswerFactory extends Factory
{
    protected $model = Answer::class;

    public function definition()
    {
        return [
            'id' => Str::uuid(),
            'text' => $this->faker->sentence(3),
            'is_correct' => false,
            'question_id' => null,
        ];
    }
}