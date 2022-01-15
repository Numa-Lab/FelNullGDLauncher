import React, { memo } from 'react';
import styled from 'styled-components';
// import { Button } from 'antd';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import BisectHostingLogo from '../../ui/BisectHosting';
// import ga from '../utils/analytics';

const BisectHosting = () => {
  return (
    <Modal
      css={`
        height: 600px;
        width: 900px;
        font-size: 10px;
        line-height: 1.8;
      `}
      title="Numa-Lab Discord"
    >
      <Container>
        <BisectHostingLogo size={60} hover />
        <h2
          css={`
            margin-top: 20px;
          `}
        >
          沼勢による{' '}
          <span
            css={`
              font-weight: 800;
            `}
          >
            『Minecraftプラグイン開発コミュニティ』
          </span>{' '}
          <span>
            です。
            <br />
          </span>{' '}
          主に{' '}
          <span
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            プラグイン開発
          </span>{' '}
          や{' '}
          <span
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            配信
          </span>{' '}
          、{' '}
          <span
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            テストプレイ
          </span>{' '}
          などをしています。
        </h2>
        {/* <a href="https://bisecthosting.com/gdl"> */}
        {/*  <Button */}
        {/*      type="primary" */}
        {/*      css={` */}
        {/*      margin-top: 25px; */}
        {/*    `} */}
        {/*      onClick={() => { */}
        {/*        ga.sendCustomEvent('BHClickAdLink'); */}
        {/*      }} */}
        {/*  > */}
        {/*    Go to BisectHosting.com &nbsp; */}
        {/*    <FontAwesomeIcon icon={faExternalLinkAlt} /> */}
        {/*  </Button> */}
        {/* </a> */}
        {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
        <iframe
          src="https://discordapp.com/widget?id=600929948529590272&theme=dark"
          width="800"
          height="380"
          allowTransparency="true"
          frameBorder="0"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
        {/* <a href="https://bisecthosting.com/gdl"> */}
        {/*  <Button */}
        {/*    type="primary" */}
        {/*    css={` */}
        {/*      margin-top: 25px; */}
        {/*    `} */}
        {/*    onClick={() => { */}
        {/*      ga.sendCustomEvent('BHClickAdLink'); */}
        {/*    }} */}
        {/*  > */}
        {/*    Go to BisectHosting.com &nbsp; */}
        {/*    <FontAwesomeIcon icon={faExternalLinkAlt} /> */}
        {/*  </Button> */}
        {/* </a> */}
      </Container>
    </Modal>
  );
};

export default memo(BisectHosting);

const Container = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  color: ${props => props.theme.palette.text.primary};
`;
