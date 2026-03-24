<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id' => 'string|required',
            'title' => 'string|required',
            'is_text_answer' => 'boolean|required',
            'guidelines' => 'string|nullable',
            'image_url' => 'string|nullable',
            'round_id' => 'required|string',
            'answers' => 'array|nullable'
        ];
    }
}
