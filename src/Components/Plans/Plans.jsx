import React, { useEffect, useState } from "react";
import { useSiteContent } from "../../content/useSiteContent";
import { SectionTitle } from "../../content/ContentText";
import "./Plans.css";

const formatPrice = (value) =>
  `₹${Number(value).toLocaleString("en-IN")}`;

// Old price is only shown when it is set and higher than the price
const hasOldPrice = (plan) => Number(plan.oldPrice) > Number(plan.price);

function Plans({ onGenerateQuotation }) {
  const content = useSiteContent("plans");
  const plans = content.items.filter((plan) => plan.name || plan.title);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedPlan(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!selectedPlan) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedPlan]);

  const handleQuotation = () => {
    if (!selectedPlan) return;

    onGenerateQuotation?.(selectedPlan);
    setSelectedPlan(null);
  };

  const handleCustomQuotation = () => {
    setSelectedPlan(null);
    onGenerateQuotation?.(null);
  };

  return (
    <>
      <section id="plans" className="plans section">
        <div className="plans-background-glow" aria-hidden="true" />
        <div className="plans-background-grid" aria-hidden="true" />

        <div className="plans-heading reveal">
          <div className="section-label light">
            <span />
            {content.label}
          </div>

          <h2>
            <SectionTitle
              lines={content.titleLines}
              accent={content.titleAccent}
              accentNewLine={content.accentNewLine}
            />
          </h2>

          <p>{content.intro}</p>
        </div>

        <div className="plans-grid">
          {plans.map((plan, index) => (
            <article
              key={index}
              className={`plan-card reveal delay-${index % 4} ${
                plan.popular ? "plan-popular" : ""
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              {plan.popular && (
                <div className="popular-badge">MOST POPULAR</div>
              )}

              <span className="plan-number">{plan.number}</span>

              <div className="plan-icon">{plan.icon}</div>

              <h3>{plan.name}</h3>

              <strong className="plan-title">{plan.title}</strong>

              <p className="plan-description">{plan.description}</p>

              <div className="plan-price">
                <div className="plan-price-top">
                  {hasOldPrice(plan) && <del>{formatPrice(plan.oldPrice)}</del>}
                  {plan.Reels && <span>{plan.Reels}</span>}
                  {plan.discount && <span>{plan.discount}</span>}
                </div>

                <strong>
                  {formatPrice(plan.price)}
                  <small>{content.priceSuffix}</small>
                </strong>
              </div>

              <div className="plan-tags">
                {plan.tags.filter(Boolean).map((tag, tagIndex) => (
                  <span key={tagIndex}>{tag}</span>
                ))}
              </div>

              <button
                type="button"
                className="view-plan-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedPlan(plan);
                }}
              >
                VIEW PLAN <span>↗</span>
              </button>

              <div className="plan-bottom-line" aria-hidden="true" />
            </article>
          ))}
        </div>

        <div className="plans-help reveal">
          <div>
            <small>{content.helpTitle}</small>
            <p>{content.helpText}</p>
          </div>

          <span className="plans-help-arrow">→</span>
        </div>

        {/* Custom Quotation */}
        <div className="plans-custom-quotation reveal">
          <p>{content.customTitle}</p>

          <span>{content.customText}</span>

          <button
            type="button"
            className="plans-custom-quotation-btn"
            onClick={handleCustomQuotation}
          >
            + CUSTOM QUOTATION <span>↗</span>
          </button>
        </div>
      </section>

      {selectedPlan && (
        <div
          className="plan-modal-overlay"
          onClick={() => setSelectedPlan(null)}
        >
          <div
            className="plan-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="plan-modal-close"
              onClick={() => setSelectedPlan(null)}
              aria-label="Close plan details"
            >
              ×
            </button>

            <div className="plan-modal-header">
              <div className="plan-modal-icon">{selectedPlan.icon}</div>

              <div>
                <span>{selectedPlan.name}</span>
                <h2 id="plan-modal-title">{selectedPlan.title}</h2>
              </div>
            </div>

            <div className="plan-modal-price">
              <div>
                {hasOldPrice(selectedPlan) && <del>{formatPrice(selectedPlan.oldPrice)}</del>}
                {selectedPlan.discount && <span>{selectedPlan.discount}</span>}
              </div>

              <strong>
                {formatPrice(selectedPlan.price)}
                <small>{content.priceSuffix}</small>
              </strong>
            </div>

            <div className="plan-modal-section-title">
              <span />
              WHAT'S INCLUDED
            </div>

            <div className="plan-includes-grid">
              {selectedPlan.includes.map((section, sectionIndex) => (
                <div className="plan-include-group" key={sectionIndex}>
                  <h3>{section.title}</h3>
                  <ul>
                    {section.items.filter(Boolean).map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <span>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="plan-outcome">
              <small>YOUR OUTCOME</small>
              <strong>{selectedPlan.outcome}</strong>
            </div>

            <div className="plan-modal-footer">
              <div>
                <small>READY TO CONTINUE?</small>
                <p>
                  Generate a quotation with this plan automatically selected.
                </p>
              </div>

              <button type="button" onClick={handleQuotation}>
                GENERATE QUOTATION <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Plans;