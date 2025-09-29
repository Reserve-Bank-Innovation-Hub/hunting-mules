"use client";

import { Button, Modal, Header, Heading1, Heading6, Heading4, hideModal } from "fictoan-react";

// ASSETS
import MulesEliminatedImage from "../../assets/images/mules-eliminated.png";
import MulesEscapeImage from "../../assets/images/mule-escape.jpg";

// STYLES
import "./game-modals.css";

interface GameModalsProps {
    mulesFoundCount: number;
    actualMuleCount: number;
    totalMoneyInCirculation: number;
}

export const GameModals = ({
    mulesFoundCount,
    actualMuleCount,
    totalMoneyInCirculation,
}: GameModalsProps) => {
    const handlePlayAgain = () => {
        window.location.reload();
    };

    return (
        <>
            {/* GAME OVER MODAL */}
            <Modal
                id="game-over-modal"
                isDismissible={false}
                showBackdrop
                blurBackdrop
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

                        <Heading1 weight="400" textColour="red" align="centre" verticalMargin="nano">
                            GAME OVER!
                        </Heading1>

                        <Heading6 weight="400" align="centre">
                            All money has been laundered!
                        </Heading6>
                    </Header>

                    <Heading4 weight="400" align="centre" marginBottom="small">
                        You found {mulesFoundCount} out of {actualMuleCount} mule accounts.
                    </Heading4>

                    <Button
                        kind="primary" horizontallyCentreThis
                        size="large" marginBottom="micro"
                        onClick={() => {
                            hideModal("game-over-modal");
                            handlePlayAgain();
                        }}
                    >
                        PLAY AGAIN
                    </Button>
                </>
            </Modal>

            {/* VICTORY MODAL */}
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

                        <Heading1 weight="400" textColour="green" align="centre" marginBottom="nano" marginTop="micro">
                            VICTORY!
                        </Heading1>

                        <Heading6 weight="400" align="centre">
                            You got all {actualMuleCount} mule accounts
                        </Heading6>
                    </Header>

                    <Heading4 weight="400" align="centre" marginBottom="small">
                        Money saved: ₹{totalMoneyInCirculation.toLocaleString("en-IN")}
                    </Heading4>

                    <Button
                        kind="primary" horizontallyCentreThis
                        size="large"
                        onClick={() => {
                            hideModal("victory-modal");
                            handlePlayAgain();
                        }}
                    >
                        PLAY AGAIN
                    </Button>
                </>
            </Modal>
        </>
    );
};