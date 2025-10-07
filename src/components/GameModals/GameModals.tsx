"use client";

// REACT CORE ==========================================================================================================
import Link from "next/link";

// UI ==================================================================================================================
import { Button, Modal, Header, Heading1, Heading6, Heading4, hideModal, Span, Div } from "fictoan-react";

// ASSETS ==============================================================================================================
import MulesEliminatedImage from "../../assets/images/mules-eliminated.png";
import MulesEscapeImage from "../../assets/images/mule-escape.jpg";

// STYLES ==============================================================================================================
import "./game-modals.css";

interface GameModalsProps {
    mulesFoundCount         : number;
    actualMuleCount         : number;
    totalMoneyInCirculation : number;
    gameOverReason          : "money" | "time" | null;
}

export const GameModals = ({
    mulesFoundCount,
    actualMuleCount,
    totalMoneyInCirculation,
    gameOverReason,
} : GameModalsProps) => {
    const handlePlayAgain = () => {
        window.location.reload();
    };

    return (
        <>
            {/* GAME OVER MODAL //////////////////////////////////////////////////////////////////////////////////// */}
                <Modal
                    id="game-over-modal"
                    isDismissible={false}
                    showBackdrop blurBackdrop padding="micro"
                    label="Game Over"
                    description="All money has been laundered by the mules"
                >
                    <>
                        <Header marginBottom="micro">
                            <img
                                className="modal-image"
                                src={MulesEscapeImage.src}
                                alt="Mules eliminated"
                            />

                            <Heading4 textColour="red" align="centre" verticalMargin="micro">
                                {gameOverReason === "time" ? "TIME'S UP!" : "GAME OVER!"}
                            </Heading4>

                            <Heading6 weight="400" align="centre">
                                {gameOverReason === "time"
                                    ? "You ran out of time!"
                                    : "All money has been laundered!"
                                }
                            </Heading6>
                        </Header>

                        <Heading4 weight="400" align="centre" marginBottom="small">
                            You found <Span weight="700">{mulesFoundCount} of {actualMuleCount}</Span> mule accounts.
                        </Heading4>

                        <Div horizontallyCentreThis>
                            <Button
                                className="eightbit-btn failure"
                                size="large" marginBottom="micro"
                                onClick={() => {
                                    hideModal("game-over-modal");
                                    handlePlayAgain();
                                }}
                            >
                                PLAY AGAIN
                            </Button>

                            <Link
                                href="https://www.figma.com/proto/hU8AxWIfkTIrNKKkqWxhh7/GFF?page-id=11%3A77&node-id=465-1225&viewport=-5%2C286%2C0.22&t=0gqj5u5AkwJ3TkMZ-8&scaling=scale-down&content-scaling=fixed&starting-point-node-id=465%3A1225&hide-ui=1">
                                <Button
                                    className="eightbit-btn"
                                    size="large" marginBottom="micro"
                                >
                                    LEARN MORE
                                </Button>
                            </Link>
                        </Div>
                    </>
                </Modal>

                {/* VICTORY MODAL ////////////////////////////////////////////////////////////////////////////////////// */}
                <Modal
                    id="victory-modal"
                    isDismissible={false}
                    showBackdrop
                    blurBackdrop
                    label="Victory"
                    description="All mule accounts have been found"
                    padding="small"
                >
                    <>
                        <Header marginBottom="micro">
                            <img
                                className="modal-image"
                                src={MulesEliminatedImage.src}
                                alt="Mules eliminated"
                            />

                            <Heading1
                                weight="400" textColour="green" align="centre" marginBottom="nano"
                                marginTop="micro"
                            >
                                VICTORY!
                            </Heading1>

                            <Heading6 weight="400" align="centre">
                                You got all {actualMuleCount} mule accounts
                            </Heading6>
                        </Header>

                        <Heading4 weight="400" align="centre" marginBottom="small">
                            Money saved: ₹{totalMoneyInCirculation.toLocaleString("en-IN")}
                        </Heading4>

                        <Link href="/">
                            <Button
                                kind="primary" horizontallyCentreThis
                                size="large"
                            >
                                PLAY AGAIN
                            </Button>
                        </Link>


                        <Link
                            href="https://www.figma.com/proto/hU8AxWIfkTIrNKKkqWxhh7/GFF?page-id=11%3A77&node-id=465-1225&viewport=-5%2C286%2C0.22&t=0gqj5u5AkwJ3TkMZ-8&scaling=scale-down&content-scaling=fixed&starting-point-node-id=465%3A1225&hide-ui=1">
                            <Button
                                className="eightbit-btn"
                                size="large" marginBottom="micro"
                            >
                                LEARN MORE
                            </Button>
                        </Link>
                    </>
                </Modal>
        </>
    );
};