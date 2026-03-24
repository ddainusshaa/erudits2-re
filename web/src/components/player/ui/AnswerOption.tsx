interface AnswerOptionProps {
  setSelectedAnswer: (value: string) => void;
  selectedAnswer: string;
  childNr: number;
  content: string;
  isTest?: boolean;
  answerId: string;
  disabled?: boolean;
}

const childData: Record<
  number,
  {
    colorClass: string;
    borderClass: string;
    flowerClass: string;
    img: string;
    alignment: string;
  }
> = {
  1: {
    colorClass: "red",
    borderClass: "border-[#d88098]",
    flowerClass: "rose",
    img: "/rose.png",
    alignment: "left",
  },
  2: {
    colorClass: "yellow",
    borderClass: "border-[#f3d75b]",
    flowerClass: "sunflower",
    img: "/sunflower.png",
    alignment: "right",
  },
  3: {
    colorClass: "green",
    borderClass: "border-[#1982c4]",
    flowerClass: "gerbera",
    img: "/gerbera.png",
    alignment: "left",
  },
  4: {
    colorClass: "blue",
    borderClass: "border-[#8ac926]",
    flowerClass: "orchid",
    img: "/orchid.png",
    alignment: "right",
  },
};

export const AnswerOption = ({
  setSelectedAnswer,
  selectedAnswer,
  childNr,
  content,
  answerId,
}: AnswerOptionProps) => {
  return (
    <div
      key={answerId}
      data-selected={selectedAnswer === answerId}
      onClick={() => setSelectedAnswer(answerId)}
      className={`answer-option_container ${childData[childNr].colorClass}`}
    >
      <p
        data-selected={selectedAnswer === answerId}
        className={`answer-option_text `}
      >
        {content}
      </p>
    </div>
  );
};
