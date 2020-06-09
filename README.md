# my-google-apps-scripts

## インフラ朝会欠席します

[infra-asakai-kesseki.gs](https://github.com/masutaka/my-google-apps-scripts/blob/master/infra-asakai-kesseki.gs)

Google Calendar インフラ朝会（月~金 10:30-10:45）のステータスが欠席だったら、始まる前に Slack の `#tech-infra` に通知する。

そこまで汎用的には作っていないため、Credential のハードコーディングだけを避け、プロパティストアへの参照にしている。

### setTrigger 関数

* 毎日 9:00-10:00 の間に実行するように「編集」→「現在のプロジェクトのトリガー」から設定した
* この関数は `notifyIfNeed` 関数を 10:20 に実行するトリガーを仕掛ける
* 時間ベースのトリガーは 1 時間単位でしか設定できないので、このような 2 段構えにした

### pruneTriggers 関数

* 実行された `notifyIfNeed` のトリガーは、二度と実行されないトリガーとして残ってしまう
* それだけなら問題はないが、[トリガーは 20 / user / script という制限があり](https://developers.google.com/apps-script/guides/services/quotas)、それを超えると新たなトリガーは作れなくなる
* 仕方がないので、この関数を毎日実行するトリガーを設定し、掃除をしている

## 今日が全休だったらSlack statusとDNDを設定する

[day-off.gs](https://github.com/masutaka/my-google-apps-scripts/blob/master/day-off.gs)

Google Calendar で今日「全休」という予定が入っていたら、Slack で以下の設定をする。

* Status を今日いっぱい「:yasumi: M/D（曜日）全休」にして、ああ全休なんだなと分かるようにする
    * 休みだから mention してくれるなという意味はないが、いつでも mention して下さいという意味もない
* DND (Do Not Distube) を翌日の AM9:00 までセットし、mention を都度通知させないようにする
    * 現在はプロダクト開発をしておらず、リアルタイムな mention は不要なため。iOS の Slack アプリにはバッジが付くので、気付いてはいる
    * 未読の mention は翌日の AM9:00 にまとめて通知が来る

半休には対応していない。私はほとんど半休しないし、退勤の時に手動でセットすれば良いので。

### main 関数

* 毎日 8:00-9:00 の間に実行するように「編集」→「現在のプロジェクトのトリガー」から設定した
