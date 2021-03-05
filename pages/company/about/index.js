import Layout from 'components/Layout';
import Hero from 'components/Hero';
import Highlight from 'components/Highlight';
import Flag, { Highlight as FlagHighlight } from 'components/Flag';
import Quote from 'components/Quote';
import Numbers, { Block as NumbersBlock } from 'components/Numbers';
import Hashicorp from 'public/images/logos/hashicorp.svg';
import DeutscheTelekom from 'public/images/logos/deutsche-telekom.svg';
import Verizon from 'public/images/logos/verizon.svg';
import Nike from 'public/images/logos/nike.svg';
import Vercel from 'public/images/logos/vercel.svg';
import LogosBar from 'components/LogosBar';
import useSWR from 'swr';
import {
  gqlStaticProps,
  imageFields,
  reviewFields,
  seoMetaTagsFields,
} from 'lib/datocms';
import { Image } from 'react-datocms';
import s from './style.module.css';
import Wrapper from 'components/Wrapper';
import Head from 'next/head';
import { renderMetaTags } from 'react-datocms';
import Space from 'components/Space';
import wretch from 'wretch';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { addMonths } from 'date-fns';
import { range } from 'range';
import InterstitialTitle from 'components/InterstitialTitle';
import regression from 'regression';

export const getStaticProps = gqlStaticProps(
  `
    {
      page: aboutPage {
        seo: _seoMetaTags {
          ...seoMetaTagsFields
        }
      }
      members: allTeamMembers {
        name
        role
        avatar {
          responsiveImage(
            imgixParams: { w: 300, h: 300, fit: facearea, facepad: 5 }
          ) {
            ...imageFields
          }
        }
      }
      review1: review(filter: { name: { eq: "Marc Ammann" } }) {
        ...reviewFields
      }
      review2: review(filter: { name: { eq: "Jeff Escalante" } }) {
        ...reviewFields
      }
    }

    ${imageFields}
    ${reviewFields}
    ${seoMetaTagsFields}
  `,
);

const fetcher = (url) => wretch(url).get().json();

const Chart = ({ data: rawData, children }) => {
  if (!rawData) {
    return null;
  }

  const width = 800;
  const height = 350;

  const data = rawData.map((point) => ({
    value: (point.value + 25000.0) * 12,
    date: parseISO(point.date),
  }));

  const coefficients = regression
    .polynomial(
      data.map((point, i) => [i, point.value]),
      { order: 2, precision: 10 },
    )
    .equation.reverse();

  const trend = range(0, data.length + 9).map((x) =>
    coefficients.reduce((sum, coeff, power) => sum + coeff * x ** power, 0),
  );

  const maxValue = Math.max.apply(null, [
    ...data.map((p) => p.value),
    ...trend,
  ]);

  const minValue = Math.min.apply(null, [
    ...data.map((p) => p.value),
    ...trend,
  ]);

  return (
    <div className={s.chart}>
      <div className={s.chartSvgAround}>
        <svg
          viewBox={`-${width * 0.01} ${height * 0.02} ${
            width * 1.02
          } ${height}`}
          className={s.chartSvg}
        >
          <path
            className={s.trendLine}
            d={
              `M 0 ${height} ` +
              trend
                .map(
                  (value, i) =>
                    `L ${(i * width) / (trend.length - 1)} ${
                      height -
                      ((value - minValue) / (maxValue - minValue)) * height
                    }`,
                )
                .join(' ')
            }
          />

          <path
            d={
              `M 0 ${height} ` +
              data
                .map(
                  (point, i) =>
                    `L ${(i * width) / (trend.length - 1)} ${
                      height -
                      ((point.value - minValue) / (maxValue - minValue)) *
                        height
                    }`,
                )
                .join(' ')
            }
          />

          {data.map((point, i) => {
            return (
              i % 3 === 0 && (
                <line
                  x1={(i * width) / (trend.length - 1)}
                  x2={(i * width) / (trend.length - 1)}
                  y1={
                    height -
                    ((point.value - minValue) / (maxValue - minValue)) * height
                  }
                  y2={
                    height -
                    ((point.value - minValue) / (maxValue - minValue)) *
                      height +
                    ((i / 3) % 2 === 0 ? 20 : -50)
                  }
                />
              )
            );
          })}

          {data.map((point, i) => {
            return (
              <circle
                cx={(i * width) / (trend.length - 1)}
                cy={
                  height -
                  ((point.value - minValue) / (maxValue - minValue)) * height
                }
                r="2"
              />
            );
          })}
        </svg>

        <div className={s.chartLabels}>
          {data.map((point, i) => {
            return (
              i % 3 === 0 && (
                <div
                  className={s.chartLabel}
                  style={{
                    left: `${(i / (trend.length - 1)) * 100.0}%`,
                    top: `${
                      100 -
                      ((point.value - minValue) / (maxValue - minValue)) * 100 +
                      ((i / 3) % 2 === 0 ? 5 : -25)
                    }%`,
                  }}
                >
                  <span>{format(point.date, 'MMM yyyy')}: </span>€
                  {parseInt(point.value).toLocaleString()}
                </div>
              )
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function About({ members, page, review1, review2 }) {
  const { data } = useSWR('/api/company/metrics', fetcher);

  return (
    <Layout>
      <Head>{renderMetaTags(page.seo)}</Head>
      <Hero
        kicker="Meet our team"
        title={
          <>
            We build tools that work{' '}
            <Highlight>the&nbsp;way&nbsp;you&nbsp;do</Highlight>
          </>
        }
        subtitle="Our mission? Help you create projects that&nbsp;truly&nbsp;feel&nbsp;yours"
      />

      <Space top={2} bottom={2}>
        <LogosBar
          title="We power experiences for over half a billion users"
          clients={[DeutscheTelekom, Hashicorp, Verizon, Nike, Vercel]}
        />
      </Space>

      <Flag
        style="good"
        image="team"
        title={
          <>
            Designed by an agency{' '}
            <FlagHighlight>
              with your&nbsp;needs&nbsp;in&nbsp;mind
            </FlagHighlight>
          </>
        }
      >
        <p>
          DatoCMS started in 2015 as an internal tool of our{' '}
          <a href="https://www.leanpanda.com/">web agency</a> and since then it
          has grown under our loving care to make our customers happy... and
          their customers too.
        </p>
        <p>
          <strong>
            We understand the needs of your clients and partners because they
            are just like ours.
          </strong>{' '}
          We know what worries you because we too choke up the night before that
          deploy.
        </p>
        <p>
          We don’t follow trends and we keep our things simple; we design every
          feature from the practical, real-world needs we see every day in our
          job.
        </p>
      </Flag>

      <Quote review={review2} />

      <Flag
        style="good"
        image="growing"
        title={
          <>
            Slowly and <FlagHighlight>steadily</FlagHighlight>
          </>
        }
      >
        <p>
          You can call us a bootstrap company, big enough to serve customers all
          over the world, small enough for a Friday evening spritz together.
        </p>
        <p>
          <strong>
            We’re healthy, happy and — excuse our language — profitable.
          </strong>
        </p>
        <p>
          We don’t want venture capital funding. We don’t have an outbound sales
          team. We like dogs more than unicorns, sharing instead of disrupting
          and we’re here to stay. We owe only our best efforts to you and
          ourselves. We've put down our roots and we want them to grow. Slowly
          but steadily.
        </p>
      </Flag>

      {data && (
        <Space bottom={3}>
          <Wrapper>
            <InterstitialTitle style="two">An Open Company</InterstitialTitle>
            <p className={s.chartSubtitle}>
              Transparency is one of the core values that guide our work. Here's
              our annual run rate (ARR), updated in real-time, pulled straight
              from the source.
            </p>
            <Chart data={data.data.recurring_revenue} />
          </Wrapper>
        </Space>
      )}

      <Wrapper>
        <div className={s.members}>
          {members.map((member) => (
            <div className={s.member} key={member.name}>
              <Image
                className={s.memberImage}
                data={member.avatar.responsiveImage}
              />
              <div className={s.memberName}>{member.name}</div>
              <div className={s.memberRole}>{member.role}</div>
            </div>
          ))}
        </div>
      </Wrapper>

      <Quote review={review1} />
    </Layout>
  );
}
