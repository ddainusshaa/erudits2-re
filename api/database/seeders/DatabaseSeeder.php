<?php

namespace Database\Seeders;

// Usage in DatabaseSeeder.php
use App\Models\Game;
use App\Models\Round;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run()
    {

        User::factory()->create();

        $questions = ["Kurš autors sarakstījis dzejas rindas Emīla Dārziņa dziesmai 'Mūžam zili'?",
                        "Kā var nosaukt pēdējās klases audzēkni vidējā mācību iestādē?",
                        "Kuram ķimiskajam elementam atbilst atomnumurs - 1?",
                        "Starp kurām valstīm norisinājās Ziemas karš?",
                        "Daudzi putni un arī daļa zīdītāju veido pārus uz mūžu. Kā sauc šādu attiecību veidu?",
                        "Atrisini ķimisko vienādojumu: Mg+CO3",
                        "Kā dēvē zināti par zīmēm un simboliem?",
                        "No cik šķautnēm sastāv kubs?",
                        "Kuras no minētajām cilvēka ķermeņa daļām nekādā gadījumā nevar sevi atjaunot?",
                        "Kas ir surogātpasts?",
                        "Ar kādu ātrumu elektrība pārvietojas vados?",
                        "Kura no šīm slavenajām popgrupām nav radusies Zviedrijā?",
                        "Protijs, deitērijs un tritijs ir ūdeņraža:",
                        "Kurā gadā notika Pirmie vispārīgie latviešu dziedāšanas svētki?",    
                        "Kurš no dotajiem fizikāliem lielumiem ir skalārs?",
                        "Kā sauc vislielāko tuksnesi pasaulē?",
                        "Par cik grādiem Zeme pagriežas 1 stundas laikā?",
                        "MCMLXXXII - kurš gads šeit uzrakstīts?",
                        "Kura no minētajām ir Latvijas senākā pilsēta?",
                        "Kura bija pirmā Latvijas iekšzemes dzelzceļa līnija?",
                        "Kādā krāsā ir saule?",
                        "Cik dažādos veidos četri cilvēki var nostāties vienā rindā?",
                        "Kāda koka zaru balodis atnesa knābī uz Noasa šķirstu pēc Grēku plūdiem kā zīmi par Dieva piedošanu?",
                        "Kā sauc leņķi, kas ir 180 grādu plats?",
                        "Kā sauc raksturlielumu statistikā, kas nosaka skaitli, kam ir vislielākais biežums datu kopā?",
                        "Cik gadu vecumā Volfgangs Amadejs Mocarts sāka komponēt savus pirmos skaņdarbus?",
                        "Kurā gadā sākās Pirmais pasaules karš?",
                        "Kurā datumā Latvija deklarēja savas neatkarības atjaunošanu?",
                        "Kurš valodnieks ieviesa jaunvārdu 'Satversme', lai aizstātu svešvārdu 'konstitūcija'?"
    ];

    $answers = [
        "Emīls Melngailis", "Rainis", "Kārlis Skalbe", "Rasa Bugavičute-Pēce",
        "Absolvents", "Abiturients", "Reflektants", "Alveolārs",
        "Berilijs", "Litijs", "Hēlijs", "Ūdeņradis",
        "Dāniju un Vāciju", "Norvēģiju un Apvienoto Karalisti", "Zviedriju un Poliju", "Somiju un PSRS",
        "Parazītisms", "Amensālisms", "Monogāmija", "Uzticība",
        "Mg₂(CO₃)₄", "MgCO₃", "Mg₂CO", "MgCO",
        "Semiotika", "Simbolika", "Semantika", "Semasioloģija",
        "6", "12", "8", "4",
        "Kauli", "Muskuļi", "Aknas", "Zobi",
        "E-pasta ziņojuma pielikums", "Atbilde uz saņemtu e-pasta ziņojumu", "E-pasta lietotne", "Nevēlams e-pasts",
        "Pusi no skaņas ātruma", "Gaismas ātrumu", "Skaņas ātrumu", "Pusi no gaismas ātruma",
        "A-ha", "ABBA", "Roxette", "Ace of Base",
        "Izomēri", "Alotropiskie veidi", "Izotopi", "Polimēri",
        "1990.", "1873.", "1918.", "1888.",
        "Pārvietojums", "Paātrinājums", "Ceļš", "Ātrums",
        "Gobi", "Antarktīda", "Sahāra", "Arktika",
        "7.5", "25", "30", "15",
        "1892.", "1882.", "1992.", "1982.",
        "Ludza", "Rīga", "Cēsis", "Jūrmala",
        "Rīga - Bolderāja", "Rīga - Jelgava", "Rīga - Daugavpils", "Rīga - Valka",
        "Oranža", "Balta", "Dzeltena", "Zila",
        "24", "30", "16", "20",
        "Palmas zaru", "Olīvzaru", "Mirres zaru", "Lauru zaru",
        "Atvērts", "Plats", "Plašs", "Izstiepts",
        "Amplitūda", "Mediāna", "Aritmētiskais vidējais", "Moda",
        "4", "5", "3", "6",
        "1914.", "1916.", "1912.", "1918.",
        "1914. gada 18. novembrī", "2004. gada 1. maijā", "1990. gada 4. maijā", "1991. gada 6. septembrī",
        "Kaspars Biezbārdis", "Atis Kronvalds", "Rainis", "Krišjānis Barons"
    ];
    

        $game = Game::factory()->create([
            'id' => Str::uuid(),
        ]);

        $rounds = collect([
            ['is_additional' => false],
            ['is_additional' => false],
            ['is_additional' => false],
            ['is_additional' => true],
        ])->map(function ($data, $index) use ($game, $questions, $answers) {
            $round = Round::factory()->create(array_merge($data, [
            'id' => Str::uuid(),
            'game_id' => $game->id,
            'order' => $index + 1,
            ]));

            collect(range(1, 30))->each(function ($order) use ($round, $questions, $answers) {
            $questionIndex = ($order - 1) % count($questions);
            $question = Question::factory()->create([
                'id' => Str::uuid(),
                'round_id' => $round->id,
                'title' => $questions[$questionIndex],
                'is_text_answer' => $order <= 3,
                'order' => $order,
            ]);

            collect(range(1, 4))->each(function ($answerIndex) use ($question, $answers, $questionIndex) {
                $answerOffset = ($questionIndex * 4) + ($answerIndex - 1);
                $answer = $answers[$answerOffset % count($answers)];
                Answer::factory()->create([
                'id' => Str::uuid(),
                'question_id' => $question->id,
                'text' => $answer,
                'is_correct' => $answerIndex === 1,
                ]);
            });
            });

            return $round;
        })->toArray();
    }
}
