import { createNode, node_render_function } from "../scene-node";

import { pushQuad } from "../draw";

let SEGMENT_GAP = 2;
let ENDS_PADDING = 2;
let SIDES_PADDING = 2;

let BACKGROUND_COLOUR = 0xFF555555;
let BAR_COLOUR = 0xFF333333;
let EMPTY_SEGMENT_COLOUR = 0xFF111111;
let BAR_HEIGHT = 16;

let node_bar_colour: number[] = [];
let node_bar_segment_width: number[] = [];
let node_bar_active_segments: number[] = [];
let node_bar_filled_segments: number[] = [];

export let createSegmentedBarNode = (segmentColour: number, segmentWidth: number, activeSegments: number, filledSegments: number): number =>
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderSegmentedBar;
  node_bar_colour[nodeId] = segmentColour;
  node_bar_segment_width[nodeId] = segmentWidth;
  node_bar_active_segments[nodeId] = activeSegments;
  node_bar_filled_segments[nodeId] = filledSegments;

  return nodeId;
};

export let updateSegmentedBarNode = (nodeId: number, activeSegments: number, filledSegments: number): void =>
{
  node_bar_active_segments[nodeId] = activeSegments;
  node_bar_filled_segments[nodeId] = filledSegments;
};

let renderSegmentedBar = (nodeId: number, now: number, delta: number): void =>
{
  let activeSegments = node_bar_active_segments[nodeId];
  let filledSegments = node_bar_filled_segments[nodeId];
  let segmentColour = node_bar_colour[nodeId];
  let segmentWidth = node_bar_segment_width[nodeId];

  let segmentsLength = (activeSegments * segmentWidth) + ((activeSegments + 1) * SEGMENT_GAP) + (SIDES_PADDING * 2);
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
};