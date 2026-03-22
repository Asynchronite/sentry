import {css} from '@emotion/react';

import {Button} from '@sentry/scraps/button';
import {Flex} from '@sentry/scraps/layout';
import {ExternalLink, Link} from '@sentry/scraps/link';
import {Text} from '@sentry/scraps/text';

import {openModal} from 'sentry/actionCreators/modal';
import {getProviderConfigUrl} from 'sentry/components/repositories/scmIntegrationTree/providerConfigLink';
import {ScmRepoTreeModal} from 'sentry/components/repositories/scmRepoTreeModal';
import {IconAdd, IconSettings} from 'sentry/icons';
import {t, tct, tn} from 'sentry/locale';
import {defined} from 'sentry/utils';
import {useOrganization} from 'sentry/utils/useOrganization';
import {SeerOverview} from 'sentry/views/settings/seer/overview/components';
import {useSeerOverviewData} from 'sentry/views/settings/seer/overview/useSeerOverviewData';

interface Props {
  isLoading: boolean;
  stats: ReturnType<typeof useSeerOverviewData>['stats'];
}

export function SCMOverviewSection({stats, isLoading}: Props) {
  const organization = useOrganization();

  return (
    <SeerOverview.Section>
      <SeerOverview.SectionHeader title={t('Source Code Management')}>
        {isLoading ? null : (
          <Link to={`/settings/${organization.slug}/seer/scm/`}>
            <Flex align="center" gap="xs">
              {t('Configure')} <IconSettings size="xs" />
            </Flex>
          </Link>
        )}
      </SeerOverview.SectionHeader>

      <SeerOverview.Stat
        value={SeerOverview.formatStatValue(
          stats.seerRepoCount,
          stats.totalRepoCount,
          isLoading
        )}
        label={tn('Repository', 'Repositories', stats.seerRepoCount)}
      />
      <SCMProviderWidgets stats={stats} isLoading={isLoading} />

      <SCMReposWidgets stats={stats} isLoading={isLoading} />
    </SeerOverview.Section>
  );
}

function SCMProviderWidgets({stats, isLoading}: Props) {
  if (isLoading) {
    return <div />;
  }
  if (stats.seerIntegrationCount === 0) {
    return (
      <Button
        priority="primary"
        size="sm"
        icon={<IconAdd />}
        onClick={() => {
          openModal(
            deps => <ScmRepoTreeModal {...deps} title={t('Install Integration')} />,
            {
              modalCss: css`
                width: 700px;
              `,
              onClose: () => {
                // TODO: invalidate queries to refresh the page
                // queryClient.invalidateQueries({queryKey: queryOptions.queryKey});
              },
            }
          );
        }}
      >
        {t('Install Integration')}
      </Button>
    );
  }
  return <div />;
}

function SCMReposWidgets({stats, isLoading}: Props) {
  if (isLoading || stats.seerIntegrationCount === 0) {
    return <div />;
  }
  if (stats.totalRepoCount === 0) {
    // no repos? link to github
    const externalLinks = stats.seerIntegrations
      .map(integration => getProviderConfigUrl(integration))
      .filter(defined);
    if (externalLinks.length === 0) {
      return (
        <Text size="sm" variant="muted">
          {t('Configure your provider to allow Sentry to see your repos.')}
        </Text>
      );
    }
    return (
      <Text size="sm" variant="muted">
        {tct('[github:Allow access] to Sentry can see your repos.', {
          github: <ExternalLink href={externalLinks[0]} />,
        })}
      </Text>
    );
  }
  if (stats.seerRepoCount !== stats.totalRepoCount) {
    return (
      <SeerOverview.ActionButton>
        <Button
          priority="primary"
          size="xs"
          icon={<IconAdd />}
          onClick={() => {
            // TODO
          }}
        >
          {t('Add all repos')}
        </Button>
        <Link
          to="#"
          onClick={e => {
            e.preventDefault();
            openModal(
              deps => <ScmRepoTreeModal {...deps} title={t('Add Repository')} />,
              {
                modalCss: css`
                  width: 700px;
                `,
                onClose: () => {
                  // TODO: invalidate queries to refresh the page
                  // queryClient.invalidateQueries({queryKey: queryOptions.queryKey});
                },
              }
            );
          }}
        >
          {t('Fine tune')}
        </Link>
      </SeerOverview.ActionButton>
    );
  }
  return <div />;
}
