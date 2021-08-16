import { createNode, node_render_function } from "../scene-node";

import { pushQuad } from "../draw";

const SEGMENT_GAP = 2;
const ENDS_PADDING = 2;
const SIDES_PADDING = 2;

const BACKGROUND_COLOUR = 0xFF555555;
const BAR_COLOUR = 0xFF333333;
const EMPTY_SEGMENT_COLOUR = 0xFF111111;
const BAR_HEIGHT = 16;

const node_bar_colour: number[] = [];
const node_bar_segment_width: number[] = [];
const node_bar_active_segments: number[] = [];
const node_bar_filled_segments: number[] = [];

export function createSegmentedBarNode(segmentColour: number, segmentWidth: number, activeSegments: number, filledSegments: number): number
{
  const nodeId = createNode();
  node_render_function[nodeId] = renderSegmentedBar;
  node_bar_colour[nodeId] = segmentColour;
  node_bar_segment_width[nodeId] = segmentWidth;
  node_bar_active_segments[nodeId] = activeSegments;
  node_bar_filled_segments[nodeId] = filledSegments;

  return nodeId;
}

export function updateSegmentedBarNode(nodeId: number, activeSegments: number, filledSegments: number): void
{
  node_bar_active_segments[nodeId] = activeSegments;
  node_bar_filled_segments[nodeId] = filledSegments;
}

function renderSegmentedBar(nodeId: number, now: number, delta: number): void
{
  const activeSegments = node_bar_active_segments[nodeId];
  const filledSegments = node_bar_filled_segments[nodeId];
  const segmentColour = node_bar_colour[nodeId];
  const segmentWidth = node_bar_segment_width[nodeId];

  const segmentsLength = (activeSegments * segmentWidth) + ((activeSegments + 1) * SEGMENT_GAP) + (SIDES_PADDING * 2);
  pushQuad(0, 0, segmentsLength, BAR_HEIGHT, BACKGROUND_COLOUR);
  pushQuad(SIDES_PADDING, ENDS_PADDING, segmentsLength - SIDES_PADDING * 2, BAR_HEIGHT - ENDS_PADDING * 2, BAR_COLOUR);

  for (let i = 0; i < activeSegments; i++)
  {
    pushQuad(SIDES_PADDING + SEGMENT_GAP + ((segmentWidth + SEGMENT_GAP) * i), ENDS_PADDING * 2, segmentWidth, BAR_HEIGHT - ENDS_PADDING * 4, EMPTY_SEGMENT_COLOUR);
  }

  for (let i = 0; i < filledSegments; i++)
  {
    pushQuad(SIDES_PADDING + SEGMENT_GAP + ((segmentWidth + SEGMENT_GAP) * i), ENDS_PADDING * 2, segmentWidth, BAR_HEIGHT - ENDS_PADDING * 4, segmentColour);
  }
}