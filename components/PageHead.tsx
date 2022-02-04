import Head from 'next/head'
import * as React from 'react'
import * as types from 'lib/types'
import config from '../site.config';

export const PageHead: React.FC<types.PageProps> = ({ site }) => {
  return (
    <Head>
      <meta charSet='utf-8' />
      <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1, shrink-to-fit=no'
      />

      {site?.description && (
        <>
          <meta name='description' content={site.description} />
          <meta property='og:description' content={site.description} />
        </>
      )}

      <meta name='theme-color' content='#EB625A' />
      <meta property='og:type' content='website' />

      {
          config.googleAnalytics?.id && (
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${config.googleAnalytics.id}`}></script>
          )
      }
      {
          config.googleAnalytics?.id && (
              <script>
                  {
                      `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());

                      gtag('config', '${config.googleAnalytics.id}');
                      `
                  }
              </script>
          )
      }
    </Head>
  )
}
