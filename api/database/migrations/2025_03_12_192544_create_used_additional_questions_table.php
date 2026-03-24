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
        Schema::create('used_additional_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid("game_instance_id")->constrained('game_instances')->onDelete('cascade');
            $table->foreignUuid("question_id")->constrained('questions')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('used_additional_questions');
    }
};
