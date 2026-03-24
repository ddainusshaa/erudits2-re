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
        Schema::create('game_instances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->boolean("private")->default(false);
            $table->string("code", 6);
            $table->date("end_date")->nullable();
            $table->foreignUuid("game_id")->constrained('games')->onDelete('cascade');
            $table->uuid('current_round')->nullable()->constrained('rounds')->onDelete('cascade');
            $table->uuid('current_question')->nullable()->constrained('questions')->onDelete('cascade');
            $table->timestamp('started_at')->nullable(); // last round/ question started at timestamp
            $table->boolean("game_started")->default(false);
            $table->boolean("buzzers_mode")->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_instances');
    }
};
