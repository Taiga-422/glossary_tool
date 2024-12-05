
$(function () {
    let wordCount = 0; // 用語集に登録する番号を管理

    // OpenAI APIの設定
    const apiKey = ""; // OpenAIのAPIキー
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    // 検索ボタンのクリックイベント
    $("#search").on("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const query = $(this).val().trim(); // 入力された検索ワード

            if (query) {
                fetchDefinition(query);
            } else {
                alert("キーワードを入力してください！");
            }
        }
    });

    // OpenAI APIを使用してキーワードの意味を取得する関数
    async function fetchDefinition(word) {
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4", // 使用するOpenAIのモデル
                    messages: [{ role: "user", content: `日本語で、次の言葉の意味を簡単に説明してください: "${word}"` }], //役割と指示文を指定してあげないといけない。
                    temperature: 0.5, // 創造性の度合い？これはよくわからんけど、chatgptに参考コードを聞いた際に使ってたから入れとく。
                }),
            });

            if (!response.ok) {
                throw new Error("データが見つかりませんでした。");
            }

            const data = await response.json();
            const definition = data.choices[0]?.message?.content?.trim() || "意味が見つかりませんでした";

            // 検索結果を表示
            $("#answer-words").val(word);
            $("#answer-detail").val(definition);
        } catch (error) {
            console.error("エラーが発生しました:", error);
            alert("ワードの取得に失敗しました。");
        }
    }

    // 用語集に登録ボタンのクリックイベント
    $("#enter").on("click", function () {
        const word = $("#answer-words").val().trim();
        const detail = $("#answer-detail").val().trim();

        if (!word || !detail) {
            alert("ワードと意味を入力してください！");
            return;
        }

        wordCount++; // 登録番号を増加

        // 用語集の行を作成
        const date = new Date().toLocaleDateString(); // 登録日を取得
        const newRow = `
            <tr>
                <td>${wordCount}</td>
                <td>${word}</td>
                <td>${detail}</td>
                <td contenteditable="true">備考を記載できます</td>
                <td>${date}</td>
            </tr>
        `;

        // 用語集エリアに行を追加
        if ($("#save-table").length === 0) {
            // 初回登録時に表を作成
            $("#save-area").html(`
                <table id="save-table" border="1">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>ワード</th>
                            <th>一般的な意味</th>
                            <th>組織内の意味</th>
                            <th>登録日</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${newRow}
                    </tbody>
                </table>
            `);
        } else {
            // 既存の表に行を追加
            $("#save-table tbody").append(newRow);
        }

        // 入力内容をリセット
        $("#answer-words").val("");
        $("#answer-detail").val("");
    });
});