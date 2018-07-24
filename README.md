# bootstrap4-kurz-und-gut

Die Dateien und Beispiele für die Ausgabe "Bootstrap 4 kurz &amp; gut", erschienen bei O'Reilly 2018.

## Nutzung

Installieren Sie *nodejs* auf Ihrem Rechner. Prüfen Sie in einer Kommandozeile oder im Terminal, dass es funktioniert:

~~~
node -v
~~~

Es sollte eine Versionsnummer ausgegeben werden, z.B. "8.11.3".

Gehen Sie in den Ordner, den Sie von Github geklont haben. Geben Sie folgendes ein:

~~~
npm i
~~~

Warten Sie, bis all Dateien geladen worden sind. Starten Sie dann den Server:

~~~
npm start
~~~

Öffnen Sie einen Browser: *http://localhost:8000*.

## Probleme

Der Port 8000 kann belegt sein. Ändern Sie den Port wie folgt:

* Öffnen Sie die Datei *srv/index.js*
* Tragen Sie in der Zeile 5 einen anderen Port ein

~~~
const port = 8000; // hier einen anderen Port eintragen
~~~
