import { IPlayer } from "../../interface/IPlayer";
import { IGameController } from "../../../universal/AdminPanelContext";

type ExportStatsPdfArgs = {
  gameTitle?: string;
  gameCode?: string;
  players: IPlayer[];
  gameController: IGameController;
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const yesNo = (value: boolean) => (value ? "Yes" : "No");

export const exportStatsPdf = ({
  gameTitle,
  gameCode,
  players,
  gameController,
}: ExportStatsPdfArgs) => {
  if (typeof window === "undefined") return;

  const playersById = new Map(players.map((player) => [player.id, player]));

  const reportPlayers = gameController.player_answers
    .map((playerAnswer) => {
      const playerMeta = playerAnswer.player_id
        ? playersById.get(playerAnswer.player_id)
        : undefined;

      return {
        playerName: playerAnswer.player_name,
        points: playerMeta?.points ?? playerAnswer.points ?? 0,
        roundFinished: !!playerAnswer.round_finished,
        questions: playerAnswer.questions ?? [],
      };
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.playerName.localeCompare(b.playerName);
    });

  const generatedAt = new Date().toLocaleString("lv-LV");
  const popup = window.open("", "_blank", "width=1200,height=900");

  if (!popup) {
    window.alert("Cannot open export window. Please allow popups for this site.");
    return;
  }

  const playersMarkup =
    reportPlayers.length > 0
      ? reportPlayers
          .map((player, index) => {
            const rowsMarkup =
              player.questions.length > 0
                ? player.questions
                    .map(
                      (question) => `
                      <tr>
                        <td>${escapeHtml(question.title)}</td>
                        <td>${escapeHtml(question.answer || "-")}</td>
                        <td class="center ${question.is_correct ? "ok" : "bad"}">${
                          question.is_correct ? "Yes" : "No"
                        }</td>
                      </tr>`
                    )
                    .join("")
                : `<tr><td colspan="3" class="empty">No submitted answers yet.</td></tr>`;

            return `
              <section class="player-block">
                <h2>${index + 1}. ${escapeHtml(player.playerName)}</h2>
                <div class="meta">
                  <span><strong>Points:</strong> ${escapeHtml(player.points)}</span>
                  <span><strong>Round finished:</strong> ${yesNo(player.roundFinished)}</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Answer</th>
                      <th>Correct</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsMarkup}
                  </tbody>
                </table>
              </section>`;
          })
          .join("")
      : `<p class="empty">No player data available yet.</p>`;

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Game Stats Export</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 24px;
            font-family: Arial, sans-serif;
            color: #111827;
            background: #f8fafc;
          }
          .header {
            background: #0f172a;
            color: #f8fafc;
            padding: 16px 18px;
            border-radius: 10px;
            margin-bottom: 16px;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
          }
          .header p {
            margin: 6px 0 0;
            font-size: 13px;
            opacity: 0.9;
          }
          .player-block {
            background: #ffffff;
            border: 1px solid #dbe3ef;
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 14px;
            page-break-inside: avoid;
          }
          .player-block h2 {
            margin: 0 0 8px;
            font-size: 18px;
          }
          .meta {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
            margin-bottom: 10px;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th, td {
            border: 1px solid #dbe3ef;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #e2e8f0;
            font-weight: 700;
          }
          .center {
            text-align: center;
            width: 90px;
            white-space: nowrap;
            font-weight: 700;
          }
          .ok { color: #166534; }
          .bad { color: #b91c1c; }
          .empty {
            text-align: center;
            color: #6b7280;
            padding: 12px;
          }
          @media print {
            body {
              background: #ffffff;
              padding: 12px;
            }
            .player-block {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <header class="header">
          <h1>${escapeHtml(gameTitle || "Game")} - Stats Export</h1>
          <p><strong>Code:</strong> ${escapeHtml(gameCode || "-")} | <strong>Generated:</strong> ${escapeHtml(generatedAt)}</p>
        </header>
        ${playersMarkup}
      </body>
    </html>`;

  popup.document.open();
  popup.document.write(html);
  popup.document.close();

  const printReport = () => {
    popup.focus();
    popup.print();
  };

  if (popup.document.readyState === "complete") {
    setTimeout(printReport, 120);
  } else {
    popup.onload = () => setTimeout(printReport, 120);
  }
};
