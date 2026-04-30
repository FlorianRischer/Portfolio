import './Impressum.css';
import Footer from '../Footer/Footer';

export default function Impressum() {
  return (
    <div className="impressum">
      <div className="impressum__content">
        <h1 className="impressum__title">Impressum</h1>

        <section className="impressum__section">
          <h2 className="impressum__heading">Angaben gemäß § 5 TMG</h2>
          <p className="impressum__text">
            Florian Rischer<br />
            Wallbergstraße 24<br />
            82110 Germering
          </p>
        </section>

        <section className="impressum__section">
          <h2 className="impressum__heading">Kontakt</h2>
          <p className="impressum__text">
            E-Mail: uxdesign@flo-rischer.de
          </p>
        </section>

        <section className="impressum__section">
          <h2 className="impressum__heading">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p className="impressum__text">
            Florian Rischer<br />
            Wallbergstraße 24<br />
            82110 Germering
          </p>
        </section>

        <section className="impressum__section">
          <h2 className="impressum__heading">Haftungsausschluss</h2>

          <h3 className="impressum__subheading">Haftung für Inhalte</h3>
          <p className="impressum__text">
            Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Als Diensteanbieter bin ich gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG bin ich als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>

          <h3 className="impressum__subheading">Haftung für Links</h3>
          <p className="impressum__text">
            Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Links umgehend entfernen.
          </p>
        </section>

        <section className="impressum__section">
          <h2 className="impressum__heading">Urheberrecht</h2>
          <p className="impressum__text">
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
}
