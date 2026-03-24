<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('player_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid("player_id")->constrained('players')->onDelete('cascade');
            $table->foreignUuid("instance_id")->constrained('game_instances')->onDelete('cascade');
            $table->foreignUuid("question_id")->constrained('questions')->onDelete('cascade');
            $table->foreignUuid("answer_id")->nullable();
            $table->string("answer_text", 48)->nullable();
            $table->boolean("is_answer_correct")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_answers');
    }
};
