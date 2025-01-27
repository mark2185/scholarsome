import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Request,
  Post,
  UseGuards,
  Body,
  Put,
  Delete
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { CardsService } from "./cards.service";
import { UsersService } from "../users/users.service";
import { AuthenticatedGuard } from "../auth/authenticated.guard";
import { SetsService } from "../sets/sets.service";
import { ApiResponse, CardIdParam, CreateCardDto, UpdateCardDto } from "@scholarsome/shared";
import { CreateCardGuard } from "./guards/create-card.guard";
import { DeleteCardGuard } from "./guards/delete-card.guard";
import { UpdateCardGuard } from "./guards/update-card.guard";
import { Card } from "@prisma/client";

@Controller("cards")
export class CardsController {
  /**
   * @ignore
   */
  constructor(
    private readonly cardsService: CardsService,
    private readonly setsService: SetsService,
    private readonly usersService: UsersService
  ) {}

  /**
   * Gets a card given a card ID
   *
   * @returns `Card` object
   */
  @Get(":cardId")
  async card(@Param() params: CardIdParam, @Request() req: ExpressRequest): Promise<ApiResponse<Card>> {
    const userCookie = this.usersService.getUserInfo(req);

    let userId = "";

    if (
      userCookie &&
      await this.usersService.user({
        id: userCookie.id
      })
    ) {
      userId = (await this.usersService.user({
        id: userCookie.id
      })).id;
    }

    const card = await this.cardsService.card({
      id: params.cardId
    });

    if (
      !card ||
      card.set.private && (card.set.authorId !== userId)
    ) {
      throw new NotFoundException();
    }

    return {
      status: "success",
      data: card
    };
  }

  /**
   * Creates a card
   *
   * @returns Created `Card` object
   */
  @UseGuards(AuthenticatedGuard, CreateCardGuard)
  @Post()
  async createCard(@Body() body: CreateCardDto): Promise<ApiResponse<Card>> {
    let media = [];

    const termScanned = await this.cardsService.scanAndUploadMedia(body.term, body.setId);
    if (termScanned) {
      body.term = termScanned.scanned;
      media = [...termScanned.media];
    }

    const definitionScanned = await this.cardsService.scanAndUploadMedia(body.definition, body.setId);
    if (definitionScanned) {
      body.definition = definitionScanned.scanned;
      media = [...media, ...definitionScanned.media];
    }

    return {
      status: "success",
      data: await this.cardsService.createCard({
        index: body.index,
        term: body.term,
        definition: body.definition,
        media: {
          createMany: {
            data: media.map((c) => {
              return {
                name: c
              };
            })
          }
        },
        set: {
          connect: {
            id: body.setId
          }
        }
      })
    };
  }

  /**
   * Updates a card
   *
   * @returns Updated `Card` object
   */
  @UseGuards(AuthenticatedGuard, UpdateCardGuard)
  @Put(":cardId")
  async updateCard(@Param() params: CardIdParam, @Body() body: UpdateCardDto): Promise<ApiResponse<Card>> {
    const card = await this.cardsService.card({ id: params.cardId });
    if (!card) throw new NotFoundException();

    let media = [];

    // there's likely a better way to write the media deletion checking
    // but for now the implementation here is sufficient
    let mediaChecked = false;

    if (body.term) {
      const termScanned = await this.cardsService.scanAndUploadMedia(body.term, card.setId);
      if (termScanned) {
        body.term = termScanned.scanned;
        media = [...termScanned.media];
      }

      for (const media of card.media) {
        mediaChecked = true;

        if (!body.definition && !body.term.includes(media.name)) {
          await this.cardsService.deleteMedia(card.setId, media.name);
        } else if (
          body.definition &&
          !body.definition.includes(media.name) &&
          !body.term.includes(media.name)
        ) {
          await this.cardsService.deleteMedia(card.setId, media.name);
        }
      }
    }

    if (body.definition) {
      const definitionScanned = await this.cardsService.scanAndUploadMedia(body.definition, card.setId);
      if (definitionScanned) {
        body.definition = definitionScanned.scanned;
        media = [...media, ...definitionScanned.media];
      }

      if (!mediaChecked) {
        for (const media of card.media) {
          if (!body.definition.includes(media.name)) {
            await this.cardsService.deleteMedia(card.setId, media.name);
          }
        }
      }
    }

    return {
      status: "success",
      data: await this.cardsService.updateCard({
        where: {
          id: params.cardId
        },
        data: {
          index: body.index,
          term: body.term,
          definition: body.definition,
          media: {
            createMany: {
              data: media.map((c) => {
                return {
                  name: c
                };
              })
            }
          }
        }
      })
    };
  }

  /**
   * Deletes a card
   *
   * @returns Deleted `Card` object
   */
  @UseGuards(AuthenticatedGuard, DeleteCardGuard)
  @Delete(":cardId")
  async deleteCard(@Param() params: CardIdParam): Promise<ApiResponse<Card>> {
    return {
      status: "success",
      data: await this.cardsService.deleteCard({
        id: params.cardId
      })
    };
  }
}
