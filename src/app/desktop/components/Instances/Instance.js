import React, { useState, useEffect, memo } from 'react';
import { transparentize } from 'polished';
import styled, { keyframes } from 'styled-components';
import { promises as fs } from 'fs';
import { LoadingOutlined } from '@ant-design/icons';
import path from 'path';
import { ipcRenderer } from 'electron';
import { Portal } from 'react-portal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faClock,
  faWrench,
  faFolder,
  faTrash,
  faStop,
  faBoxOpen,
  faCopy,
  // faServer,
  faHammer
} from '@fortawesome/free-solid-svg-icons';
import psTree from 'ps-tree';
import { ContextMenuTrigger, ContextMenu, MenuItem } from 'react-contextmenu';
import { useSelector, useDispatch } from 'react-redux';
import {
  _getInstance,
  _getInstancesPath,
  _getDownloadQueue
} from '../../../../common/utils/selectors';
import {
  addStartedInstance,
  addToQueue,
  launchInstance
} from '../../../../common/reducers/actions';
import { openModal } from '../../../../common/reducers/modals/actions';
import instanceDefaultBackground from '../../../../common/assets/instance_default.png';
import { convertMinutesToHumanTime } from '../../../../common/utils';
// import BisectHostingLogo from '../../../../ui/BisectHosting';
import { FABRIC, FORGE, VANILLA } from '../../../../common/utils/constants';

const Container = styled.div`
  position: relative;
  width: 180px;
  height: 100px;
  transform: ${p =>
    p.isHovered && !p.installing
      ? 'scale3d(1.1, 1.1, 1.1)'
      : 'scale3d(1, 1, 1)'};
  margin-right: 20px;
  margin-top: 20px;
  transition: transform 150ms ease-in-out;
  &:hover {
    ${p => (p.installing ? '' : 'transform: scale3d(1.1, 1.1, 1.1);')}
  }
`;

const Spinner = keyframes`
  0% {
    transform: translate3d(-50%, -50%, 0) rotate(0deg);
  }
  100% {
    transform: translate3d(-50%, -50%, 0) rotate(360deg);
  }
`;

const PlayButtonAnimation = keyframes`
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const InstanceContainer = styled.div`
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  font-size: 20px;
  overflow: hidden;
  height: 100%;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
    url('${props => props.background}') center no-repeat;
  background-position: center;
  color: ${props => props.theme.palette.text.secondary};
  font-weight: 600;
  background-size: cover;
  border-radius: 4px;
  margin: 10px;
`;

const HoverContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  margin: 10px;
  padding: 10px;
  text-align: center;
  font-weight: 800;
  border-radius: 4px;
  transition: opacity 150ms ease-in-out;
  width: 100%;
  height: 100%;
  opacity: ${p => (p.installing || p.isHovered ? '1' : '0')};
  backdrop-filter: blur(4px);
  will-change: opacity;
  background: ${p => transparentize(0.5, p.theme.palette.grey[800])};
  &:hover {
    opacity: 1;
  }

  .spinner:before {
    animation: 1.5s linear infinite ${Spinner};
    animation-play-state: inherit;
    border: solid 3px transparent;
    border-bottom-color: ${props => props.theme.palette.colors.yellow};
    border-radius: 50%;
    content: '';
    height: 30px;
    width: 30px;
    position: absolute;
    top: 10px;
    transform: translate3d(-50%, -50%, 0);
    will-change: transform;
  }
`;

const MCVersion = styled.div`
  position: absolute;
  right: 5px;
  top: 5px;
  font-size: 11px;
  color: ${props => props.theme.palette.text.third};
`;

const TimePlayed = styled.div`
  position: absolute;
  left: 5px;
  top: 5px;
  font-size: 11px;
  color: ${props => props.theme.palette.text.third};
`;

const MenuInstanceName = styled.div`
  background: ${props => props.theme.palette.grey[800]};
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: ${props => props.theme.palette.text.primary};
  padding: 0 20px;
  font-weight: 700;
`;

const Instance = ({ instanceName }) => {
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [background, setBackground] = useState(`${instanceDefaultBackground}`);
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const downloadQueue = useSelector(_getDownloadQueue);
  const currentDownload = useSelector(state => state.currentDownload);
  const startedInstances = useSelector(state => state.startedInstances);
  const instancesPath = useSelector(_getInstancesPath);
  const isInQueue = downloadQueue[instanceName];

  const isPlaying = startedInstances[instanceName];

  useEffect(() => {
    if (instance.background) {
      fs.readFile(path.join(instancesPath, instanceName, instance.background))
        .then(res =>
          setBackground(`data:image/png;base64,${res.toString('base64')}`)
        )
        .catch(console.warning);
    } else {
      setBackground(`${instanceDefaultBackground}`);
    }
  }, [instance.background, instancesPath, instanceName]);

  const startInstance = () => {
    if (isInQueue || isPlaying) return;
    dispatch(addStartedInstance({ instanceName }));
    dispatch(launchInstance(instanceName));
  };
  const openFolder = () => {
    ipcRenderer.invoke('openFolder', path.join(instancesPath, instance.name));
  };
  const openConfirmationDeleteModal = () => {
    dispatch(openModal('InstanceDeleteConfirmation', { instanceName }));
  };
  const manageInstance = () => {
    dispatch(openModal('InstanceManager', { instanceName }));
  };
  // const openBisectModal = () => {
  //   dispatch(openModal('BisectHosting'));
  // };
  const instanceExportCurseForge = () => {
    dispatch(openModal('InstanceExportCurseForge', { instanceName }));
  };
  const openDuplicateNameDialog = () => {
    dispatch(openModal('InstanceDuplicateName', { instanceName }));
  };
  const killProcess = () => {
    console.log(isPlaying.pid);
    psTree(isPlaying.pid, (err, children) => {
      if (children?.length) {
        children.forEach(el => {
          if (el) {
            try {
              process.kill(el.PID);
            } catch {
              // No-op
            }
          }
        });
      } else {
        try {
          process.kill(isPlaying.pid);
        } catch {
          // No-op
        }
      }
    });
  };

  return (
    <>
      <ContextMenuTrigger id={instanceName}>
        <Container
          installing={isInQueue}
          onClick={startInstance}
          isHovered={isHovered || isPlaying}
        >
          <InstanceContainer installing={isInQueue} background={background}>
            <TimePlayed>
              <FontAwesomeIcon
                icon={faClock}
                css={`
                  margin-right: 5px;
                `}
              />

              {convertMinutesToHumanTime(instance.timePlayed)}
            </TimePlayed>
            <MCVersion>{instance.loader?.mcVersion}</MCVersion>
            {instanceName}
          </InstanceContainer>
          <HoverContainer
            installing={isInQueue}
            isHovered={isHovered || isPlaying}
          >
            {currentDownload === instanceName ? (
              <>
                <div
                  css={`
                    font-size: 14px;
                  `}
                >
                  {isInQueue ? isInQueue.status : null}
                </div>
                {`${isInQueue.percentage}%`}
                <LoadingOutlined
                  css={`
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                  `}
                />
              </>
            ) : (
              <>
                {isPlaying && (
                  <div
                    css={`
                      position: relative;
                      width: 20px;
                      height: 20px;
                    `}
                  >
                    {isPlaying.initialized && (
                      <FontAwesomeIcon
                        css={`
                          color: ${({ theme }) => theme.palette.colors.green};
                          font-size: 27px;
                          position: absolute;
                          margin-left: -6px;
                          margin-top: -2px;
                          animation: ${PlayButtonAnimation} 0.5s
                            cubic-bezier(0.75, -1.5, 0, 2.75);
                        `}
                        icon={faPlay}
                      />
                    )}
                    {!isPlaying.initialized && <div className="spinner" />}
                  </div>
                )}
                {isInQueue && '待機中...'}
                {!isInQueue && !isPlaying && <span>PLAY</span>}
              </>
            )}
          </HoverContainer>
        </Container>
      </ContextMenuTrigger>
      <Portal>
        <ContextMenu
          id={instance.name}
          onShow={() => setIsHovered(true)}
          onHide={() => setIsHovered(false)}
        >
          <MenuInstanceName>{instanceName}</MenuInstanceName>
          {/* <MenuItem */}
          {/*  onClick={openBisectModal} */}
          {/*  preventClose */}
          {/*  css={` */}
          {/*    display: flex; */}
          {/*    flex-direction: column; */}
          {/*    align-items: center; */}
          {/*    justify-content: center; */}
          {/*    text-align: center; */}
          {/*    height: 60px; */}
          {/*    font-size: 18px; */}
          {/*    // font-weight: bold; */}
          {/*    border: 2px solid #04cbeb; */}
          {/*    border-radius: 5px; */}
          {/*  `} */}
          {/* > */}
          {/*  <BisectHostingLogo hover showPointerCursor /> */}
          {/*  /!* Create Server *!/ */}
          {/* </MenuItem> */}
          {isPlaying && (
            <MenuItem onClick={killProcess}>
              <FontAwesomeIcon
                icon={faStop}
                css={`
                  margin-right: 10px;
                  width: 25px !important;
                `}
              />
              強制終了
            </MenuItem>
          )}
          <MenuItem disabled={Boolean(isInQueue)} onClick={manageInstance}>
            <FontAwesomeIcon
              icon={faWrench}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            インスタンス設定
          </MenuItem>
          <MenuItem onClick={openFolder}>
            <FontAwesomeIcon
              icon={faFolder}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            フォルダを開く
          </MenuItem>

          {/* // TODO - Support other export options besides curseforge forge. */}
          <MenuItem
            onClick={instanceExportCurseForge}
            disabled={
              Boolean(isInQueue) ||
              !(
                instance.loader?.loaderType === FORGE ||
                instance.loader?.loaderType === FABRIC ||
                instance.loader?.loaderType === VANILLA
              )
            }
          >
            <FontAwesomeIcon
              icon={faBoxOpen}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            Zipエクスポート
          </MenuItem>
          <MenuItem
            disabled={Boolean(isInQueue)}
            onClick={openDuplicateNameDialog}
          >
            <FontAwesomeIcon
              icon={faCopy}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            複製する
          </MenuItem>
          <MenuItem divider />
          <MenuItem
            disabled={Boolean(isInQueue) || Boolean(isPlaying)}
            onClick={async () => {
              let manifest = null;
              try {
                manifest = JSON.parse(
                  await fs.readFile(
                    path.join(instancesPath, instanceName, 'manifest.json')
                  )
                );
              } catch {
                // NO-OP
              }

              dispatch(
                addToQueue(
                  instanceName,
                  instance.loader,
                  manifest,
                  instance.background,
                  instance.timePlayed
                )
              );
            }}
          >
            <FontAwesomeIcon
              icon={faHammer}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            インスタンス修復
          </MenuItem>
          <MenuItem
            disabled={Boolean(isInQueue) || Boolean(isPlaying)}
            onClick={openConfirmationDeleteModal}
          >
            <FontAwesomeIcon
              icon={faTrash}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            インスタンス削除
          </MenuItem>
          <MenuItem divider />
          {/* <MenuItem */}
          {/*  onClick={openBisectModal} */}
          {/*  preventClose */}
          {/*  css={` */}
          {/*    border: 2px solid #04cbeb; */}
          {/*    border-radius: 5px; */}
          {/*  `} */}
          {/* > */}
          {/*  <FontAwesomeIcon */}
          {/*    icon={faServer} */}
          {/*    css={` */}
          {/*      margin-right: 10px; */}
          {/*      width: 25px !important; */}
          {/*    `} */}
          {/*  /> */}
          {/*  Create Server */}
          {/* </MenuItem> */}
        </ContextMenu>
      </Portal>
    </>
  );
};

export default memo(Instance);
