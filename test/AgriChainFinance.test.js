const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgriChainFinance", function () {
    let agriChain;
    let owner, farmer, investor1, investor2;

    beforeEach(async function () {
        [owner, farmer, investor1, investor2] = await ethers.getSigners();

        const AgriChainFinance = await ethers.getContractFactory("AgriChainFinance");
        agriChain = await AgriChainFinance.deploy();
    });

    describe("Harvest Token Creation", function () {
        it("Should create harvest token successfully", async function () {
            const tx = await agriChain.connect(farmer).createHarvestToken(
                ethers.ZeroAddress,
                "Corn",
                1000, // 1000 kg
                200000, // $2000 in cents
                Math.floor(Date.now() / 1000) + 86400 * 90 // 90 days from now
            );

            await expect(tx).to.emit(agriChain, "HarvestTokenCreated");

            const token = await agriChain.harvestTokens(0);
            expect(token.cropType).to.equal("Corn");
            expect(token.farmer).to.equal(farmer.address);
        });
    });

    describe("Loan Request", function () {
        it("Should request loan with valid collateral", async function () {
            // Create harvest token first
            await agriChain.connect(farmer).createHarvestToken(
                ethers.ZeroAddress,
                "Rice",
                2000,
                300000, // $3000
                Math.floor(Date.now() / 1000) + 86400 * 120
            );

            // Request loan (70% of collateral)
            const tx = await agriChain.connect(farmer).requestLoan(
                0, // harvestTokenId
                210000, // $2100 (70% of $3000)
                500, // 5% interest
                90 // 90 days
            );

            await expect(tx).to.emit(agriChain, "LoanRequested");
        });
    });

    describe("Investment", function () {
        beforeEach(async function () {
            await agriChain.connect(farmer).createHarvestToken(
                ethers.ZeroAddress,
                "Wheat",
                1500,
                250000,
                Math.floor(Date.now() / 1000) + 86400 * 100
            );

            await agriChain.connect(farmer).requestLoan(0, 175000, 500, 90);
        });

        it("Should allow investment in loan", async function () {
            const investAmount = ethers.parseEther("1");

            const tx = await agriChain.connect(investor1).investInLoan(0, {
                value: investAmount
            });

            await expect(tx).to.emit(agriChain, "LoanFunded");
        });
    });
});
