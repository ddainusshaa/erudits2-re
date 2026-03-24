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
        Schema::create('rounds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string("title", 32)->index();
            $table->integer("disqualify_amount")->default(0);
            $table->float("answer_time")->default(30);
            $table->integer("points")->default(1);
            $table->boolean("is_additional")->default(false);
            $table->boolean('is_test')->default(false);
            $table->foreignUuid("game_id")->constrained('games')->onDelete('cascade');
            $table->integer("order")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rounds');
    }
};
