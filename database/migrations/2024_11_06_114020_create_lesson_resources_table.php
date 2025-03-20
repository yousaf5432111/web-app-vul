<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLessonResourcesTable extends Migration
{
    public function up()
    {
        Schema::create('lesson_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->string('resource_type'); // Resource type (e.g., Video, Document, Link)
            $table->string('url');           // URL to the resource
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('lesson_resources');
    }
}
