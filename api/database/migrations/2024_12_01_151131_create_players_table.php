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
        Schema::create('players', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string("player_name", 16)->nullable();
            $table->integer("points")->default(0);
            $table->integer("is_disqualified")->default(false);
            $table->boolean("round_finished")->default(false);
            $table->foreignUuid("instance_id")->constrained('game_instances')->onDelete('cascade');
            $table->boolean("buzzer_enabled")->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
