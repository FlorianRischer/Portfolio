import './Datenschutz.css';
import Footer from '../Footer/Footer';

export default function Datenschutz() {
  return (
    <div className="datenschutz">
      <div className="datenschutz__content">
        <h1 className="datenschutz__title">Datenschutzerklärung</h1>

        <section className="datenschutz__section">
          <h2 className="datenschutz__heading">1. Verantwortlicher</h2>
          <p className="datenschutz__text">
            Florian Rischer<br />
            Wallbergstraße 24<br />
            82110 Germering<br />
            E-Mail: uxdesign@flo-rischer.de
          </p>
        </section>

        <section className="datenschutz__section">
          <h2 className="datenschutz__heading">2. Allgemeines zur Datenverarbeitung</h2>
          <p className="datenschutz__text">
            Der Schutz Ihrer persönlichen Daten ist mir ein besonderes Anliegen. Ich verarbeite Ihre personenbezogenen Daten ausschließlich im Einklang mit der Datenschutz-Grundverordnung (DSGVO) und dem Bundesdatenschutzgesetz (BDSG). Diese Datenschutzerklärung informiert Sie über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten auf dieser Website.
          </p>
        </section>

        <section className="datenschutz__section">
          <h2 className="datenschutz__heading">3. Hosting</h2>
          <p className="datenschutz__text">
            Diese Website wird bei einem externen Dienstleister gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich insbesondere um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln. Der Einsatz des Hosters erfolgt im Interesse einer sicheren, schnellen und effizienten Bereitstellung meines Online-Angebots (Art. 6 Abs. 1 lit. f DSGVO).
          </p>
        </section>

        <section className="datenschutz__section">
          <h2 className="datenschutz__heading">4. Zugriffsdaten und Server-Logfiles</h2>
          <p className="datenschutz__text">
            Der Hoster dieser Seiten erhebt und speichert automatisch Informationen in sogenannten Server-Logfiles, die Ihr Browser automatisch übermittelt. Dies sind:
          </p>
          <ul className="datenschutz__list">
            <li>Browsertyp und Browserversion</li>
            <li>Verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
            <li>IP-Adresse</li>
          </ul>
          <p className="datenschutz__text">
            Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung und Optimierung seiner Website.
          </p>
        </section>

        <section className="datenschutz__section">
          <h2 className="datenschutz__heading">5. Kontaktaufnahme per E-Mail</h2>
          <p className="datenschutz__text">
            Wenn Sie mich per E-Mail kontaktieren, werden Ihre Angaben inklusive der von Ihnen angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei mir gespeichert. Diese Daten gebe ich nicht ohne Ihre Einwilligung weiter. Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf meinem berechtigten Interesse (Art. 6 Abs. 1 lit. f DSGVO).
          </p>
        </section>

        <section className="datenschutz__section">
          <h2 className="datenschutz__heading">6. Externe Links</h2>
          <p className="datenschutz__text">
            Diese Website enthält Links zu externen Websites (z.B. LinkedIn). Beim Anklicken dieser Links werden Sie auf die Seiten Dritter weitergeleitet. Ich habe keinen Einfluss auf die dort geltenden Datenschutzbestimmungen und verweise auf die jeweiligen Datenschutzerklärungen der Betreiber.
          </p>
        </section>

        <section className="datenschutz__section">
          <h2 className="datenschutz__heading">7. SSL-/TLS-Verschlüsselung</h2>
          <p className="datenschutz__text">
            Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://" auf „https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
          </p>
        </section>

        <section className="datenschutz__section">
          <h2 className="datenschutz__heading">8. Ihre Rechte</h2>
          <p className="datenschutz__text">
            Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit an mich wenden:
          </p>
          <p className="datenschutz__text">
            Florian Rischer<br />
            E-Mail: uxdesign@flo-rischer.de
          </p>
          <p className="datenschutz__text">
            Darüber hinaus steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
}
